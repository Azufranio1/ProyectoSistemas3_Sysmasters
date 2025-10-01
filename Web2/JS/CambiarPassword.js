const form = document.getElementById('passwordChangeForm');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        const requirements = {
            length: /.{8,}/,
            uppercase: /[A-Z]/,
            lowercase: /[a-z]/,
            number: /[0-9]/,
            special: /[!@#$%^&*]/   
        };

        function validatePassword() {
            const pwd = password.value;
            let valid = true;

            for (const [requirement, regex] of Object.entries(requirements)) {
                const isValid = regex.test(pwd);
                const element = document.getElementById(requirement);
                element.classList.toggle('valid', isValid);
                element.classList.toggle('invalid', !isValid);
                valid = valid && isValid;
            }

            const passwordsMatch = password.value === confirmPassword.value;
            const matchElement = document.getElementById('match');
            matchElement.classList.toggle('valid', passwordsMatch);
            matchElement.classList.toggle('invalid', !passwordsMatch);
            valid = valid && passwordsMatch;

            return valid;
        }

        password.addEventListener('input', validatePassword);
        confirmPassword.addEventListener('input', validatePassword);

        form.addEventListener('submit', function(e) {
            if (!validatePassword()) {
                e.preventDefault();
                alert('Por favor, asegúrate de cumplir todos los requisitos de la contraseña.');
            }
        });