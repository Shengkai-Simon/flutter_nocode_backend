import i18n from "i18next";
import {initReactI18next} from "react-i18next";

const resources = {
    en: {
        translation: {
            // Login Page
            "login.title": "Login",
            "login.description": "Enter your credentials to access your account.",
            "login.emailLabel": "Email",
            "login.passwordLabel": "Password",
            "login.button": "Log In",
            "login.registerLink": "Don't have an account? Sign Up",

            // Register Page
            "register.title": "Create an account",
            "register.description": "Enter your information to create a new account.",
            "register.emailLabel": "Email",
            "register.passwordLabel": "Password",
            "register.confirmPasswordLabel": "Confirm Password",
            "register.button": "Create Account",
            "register.loginLink": "Already have an account? Log In",
            // Zod validation messages
            "validation.email.invalid": "Please enter a valid email address.",
            "validation.password.min": "Password must be at least 8 characters long.",
            "validation.password.regex": "Password must contain at least one letter and one number.",
            "validation.password.mismatch": "Passwords do not match.",

            // Verify Page
            "verify.title": "Email Verification",
            "verify.description": "A 6-digit code has been sent to {{email}}.",
            "verify.codeLabel": "Verification Code",
            "verify.button": "Verify",
            "verify.resendLink": "Didn't receive a code? Resend",
            "verify.resendCooldown": "Resend in {{seconds}}s",
            "verify.codeSent": "A new code has been sent.",
            "verify.codeInvalid": "Please enter a 6-digit verification code.",
            "verify.success": "Verification successful! You can now log in.",
            "verify.sendFailed": "Failed to send, please try again.",

            // General Errors
            "error.unknown": "An unknown error occurred, please try again later.",
        }
    }
};

i18n
    .use(initReactI18next) // Pass the i18n instance to react-i18next
    .init({
        resources,
        lng: "en", // Default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react XSS prophylaxis has been done
        }
    });

export default i18n;
