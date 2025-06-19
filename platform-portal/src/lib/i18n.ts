import i18n from "i18next";
import {initReactI18next} from "react-i18next";

const resources = {
    en: {
        translation: {
            // General Errors
            "error.unknown": "An unknown error occurred, please try again later.",
            "error.accountLocked": "User account is locked.",
            "error.accountLockedReset": "Cannot reset password for a locked account. Please unlock it first.",

            "general.name": "Flutter No-Code Platform",
            "general.desc": "\"Visual build, one-click deployment. Your next great app starts here. \"",
            "general.unlock": "Unlock Account",
            "general.request.link": "Request a New Link",
            "general.back.login": "Back to Login",
            "general.check.email": "Check your email",
            "general.invalidLink.title": "Invalid Link",
            "general.emailLabel": "Email",

            // Login Page
            "login.title": "Login",
            "login.description": "Enter your credentials to access your account.",
            "login.passwordLabel": "Password",
            "login.button": "Log In",
            "login.registerLink": "Don't have an account? Sign Up",
            "login.forgotPasswordLink": "Forgot your password?",

            // Register Page
            "register.title": "Create an account",
            "register.description": "Enter your information to create a new account.",
            "register.passwordLabel": "Password",
            "register.confirmPasswordLabel": "Confirm Password",
            "register.button": "Create Account",
            "register.loginLink": "Already have an account? Log In",

            // Verify Page
            "verify.title": "Email Verification",
            "verify.description": "A 6-digit code has been sent to {{email}}.",
            "verify.button": "Verify",
            "verify.resendLink": "Didn't receive a code? Resend",
            "verify.resendCooldown": "Resend in {{seconds}}s",
            "verify.success.title": "Verification Successful!",
            "verify.success.description": "You can now log in with your new account. Redirecting...",

            // Forgot Password Page
            "forgotPassword.form.title": "Forgot Password",
            "forgotPassword.form.description": "Enter your email and we will send you a link to reset your password.",
            "forgotPassword.form.submitText": "Send Reset Link",
            "forgotPassword.success.description": "We've sent a password reset link to your email address.",

            // Reset Password Page
            "resetPassword.form.title": "Reset Password",
            "resetPassword.form.description": "Enter your new password below. Make sure it's secure.",
            "resetPassword.form.newPasswordLabel": "New Password",
            "resetPassword.form.confirmPasswordLabel": "Confirm New Password",
            "resetPassword.form.submitText": "Set New Password",
            "resetPassword.success.title": "Password Reset Successfully!",
            "resetPassword.success.description": "You can now log in with your new password. Redirecting...",
            "resetPassword.invalidLink.description": "No reset token provided. Please request a new password reset link.",

            // Unlock Account Flow
            "requestUnlock.form.description": "Enter your email to receive an account unlock token.",
            "requestUnlock.form.submitText": "Send Unlock Token",
            "requestUnlock.success.description": "We've sent an unlock link to {{email}}. Please click the link to unlock your account.",
            "performUnlock.loading.title": "Unlocking Account...",
            "performUnlock.loading.description": "Please wait while we verify your request.",
            "performUnlock.success.title": "Account Unlocked!",
            "performUnlock.success.description": "Your account has been successfully unlocked. Redirecting to login...",
            "performUnlock.invalidLink.description": "The unlock link is missing a token. Please request a new one.",
            "performUnlock.error.title": "Unlock Failed",
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
