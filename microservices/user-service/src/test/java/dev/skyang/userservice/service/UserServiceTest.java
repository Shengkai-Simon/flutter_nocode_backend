package dev.skyang.userservice.service;

import dev.skyang.userservice.config.RoleConstants;
import dev.skyang.userservice.dto.NotificationMessage;
import dev.skyang.userservice.dto.RegistrationRequest;
import dev.skyang.userservice.dto.VerificationRequest;
import dev.skyang.userservice.model.Role;
import dev.skyang.userservice.model.User;
import dev.skyang.userservice.model.UserStatus;
import dev.skyang.userservice.repository.RoleRepository;
import dev.skyang.userservice.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private RabbitTemplate rabbitTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private UserService userService;

    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "password123";

    @Nested
    @DisplayName("User Registration")
    class Registration {
        @Test
        @DisplayName("The new user should be successfully registered")
        void shouldRegisterNewUserSuccessfully() {
            // given
            when(redisTemplate.opsForValue()).thenReturn(valueOperations);
            RegistrationRequest request = new RegistrationRequest();
            request.setEmail(TEST_EMAIL);
            request.setPassword(TEST_PASSWORD);

            when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());
            when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn("hashedPassword");
            when(roleRepository.findByName(RoleConstants.ROLE_USER)).thenReturn(Optional.of(new Role(RoleConstants.ROLE_USER)));
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // when
            userService.register(request);

            // then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();

            assertThat(savedUser.getEmail()).isEqualTo(TEST_EMAIL);
            assertThat(savedUser.getPassword()).isEqualTo("hashedPassword");
            assertThat(savedUser.getStatus()).isEqualTo(UserStatus.AWAITING_VERIFICATION);
            assertThat(savedUser.getRoles()).extracting(Role::getName).contains(RoleConstants.ROLE_USER);

            verify(valueOperations).set(eq("verification:code:" + TEST_EMAIL), anyString(), eq(5L), eq(TimeUnit.MINUTES));
            verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(NotificationMessage.class));
        }

        @Test
        @DisplayName("An exception should be thrown when an activated user registers again")
        void shouldThrowExceptionWhenRegisteringAnAlreadyActiveUser() {
            // given
            RegistrationRequest request = new RegistrationRequest();
            request.setEmail(TEST_EMAIL);

            User activeUser = new User();
            activeUser.setStatus(UserStatus.ACTIVE);
            when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(activeUser));

            // when & then
            assertThatThrownBy(() -> userService.register(request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("User with email " + TEST_EMAIL + " already exists and is active.");
        }
    }

    @Nested
    @DisplayName("Account Verification")
    class Verification {
        @Test
        @DisplayName("The account should be successfully activated with a valid verification code")
        void shouldVerifyAccountWithValidCode() {
            // given
            when(redisTemplate.opsForValue()).thenReturn(valueOperations);
            VerificationRequest request = new VerificationRequest();
            request.setEmail(TEST_EMAIL);
            request.setCode("123456");

            User unverifiedUser = new User();
            unverifiedUser.setEmail(TEST_EMAIL);
            unverifiedUser.setStatus(UserStatus.AWAITING_VERIFICATION);

            when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(unverifiedUser));
            when(valueOperations.get("verification:code:" + TEST_EMAIL)).thenReturn("123456");

            // when
            userService.verify(request);

            // then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertThat(userCaptor.getValue().getStatus()).isEqualTo(UserStatus.ACTIVE);

            verify(redisTemplate).delete("verification:code:" + TEST_EMAIL);
        }

        @Test
        @DisplayName("Verification with an invalid CAPTCHA should throw an exception")
        void shouldThrowExceptionForInvalidVerificationCode() {
            // given
            when(redisTemplate.opsForValue()).thenReturn(valueOperations);
            VerificationRequest request = new VerificationRequest();
            request.setEmail(TEST_EMAIL);
            request.setCode("wrong-code");

            when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(new User()));
            when(valueOperations.get("verification:code:" + TEST_EMAIL)).thenReturn("correct-code");

            // when & then
            assertThatThrownBy(() -> userService.verify(request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Invalid verification code.");
        }
    }

    @Nested
    @DisplayName("Admin Functions")
    class AdminFunctions {
        @Test
        @DisplayName("Should be able to successfully assign roles to users")
        void shouldAssignRoleToUser() {
            // given
            User user = new User();
            user.setId(1L);
            user.setRoles(new HashSet<>());
            Role adminRole = new Role(RoleConstants.ROLE_ADMIN);

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(roleRepository.findByName(RoleConstants.ROLE_ADMIN)).thenReturn(Optional.of(adminRole));

            // when
            userService.assignRoleToUser(1L, RoleConstants.ROLE_ADMIN);

            // then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertThat(userCaptor.getValue().getRoles()).contains(adminRole);
        }

        @Test
        @DisplayName("Should be able to successfully remove the user role")
        void shouldRevokeRoleFromUser() {
            // given
            User user = new User();
            user.setId(1L);
            Role adminRole = new Role(RoleConstants.ROLE_ADMIN);
            user.setRoles(new HashSet<>(Set.of(adminRole)));

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(roleRepository.findByName(RoleConstants.ROLE_ADMIN)).thenReturn(Optional.of(adminRole));

            // when
            userService.revokeRoleFromUser(1L, RoleConstants.ROLE_ADMIN);

            // then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertThat(userCaptor.getValue().getRoles()).doesNotContain(adminRole);
        }
    }
}