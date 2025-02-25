// Mostrar/ocultar contraseña
function togglePassword() {
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("confirmar_password");
    const checkbox = document.getElementById("mostrar_contrasena");

    if (checkbox.checked) {
        passwordField.type = "text";
        if (confirmPasswordField) {
            confirmPasswordField.type = "text";
        }
    } else {
        passwordField.type = "password";
        if (confirmPasswordField) {
            confirmPasswordField.type = "password";
        }
    }
}

// Registro de usuarios
document.getElementById('registerForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role')?.value || 'operator'; // Rol por defecto: operador
    const message = document.getElementById('registerMessage');

    if (!isValidUsername(username)) {
        message.textContent = 'El nombre de usuario debe tener al menos 3 caracteres y no contener símbolos.';
        message.style.color = 'red';
        return;
    }

    if (!isValidPassword(password)) {
        message.textContent = 'La contraseña debe tener al menos 8 caracteres, un número y un carácter especial.';
        message.style.color = 'red';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(user => user.username === username)) {
        message.textContent = 'El usuario ya existe. Prueba con otro nombre.';
        message.style.color = 'red';
        return;
    }

    users.push({ username, password, role });
    localStorage.setItem('users', JSON.stringify(users));

    message.textContent = 'Registro exitoso. Redirigiendo al inicio de sesión...';
    message.style.color = 'green';
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});

// Inicio de sesión
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const message = document.getElementById('loginMessage');

    if (!username || !password) {
        message.textContent = 'Por favor, completa todos los campos.';
        message.style.color = 'red';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
        message.textContent = 'Usuario o contraseña incorrectos.';
        message.style.color = 'red';
        return;
    }

    localStorage.setItem('loggedInUser', JSON.stringify(user));
    message.textContent = 'Inicio de sesión exitoso. Redirigiendo al panel...';
    message.style.color = 'green';
    setTimeout(() => {
        window.location.href = 'panel.html';
    }, 1500);
});

// Proteger acceso al panel
if (window.location.pathname.endsWith('panel.html')) {
    window.addEventListener('load', function () {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
        if (!loggedInUser) {
            // Si no hay usuario autenticado, redirigir al inicio de sesión
            window.location.href = 'registro.html';
            return;
        }
    
        // Mostrar el nombre del usuario autenticado
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.textContent = `Bienvenido, ${loggedInUser.username}`;
    
        // Mostrar la tabla de usuarios para todos los roles
        loadUsers();
    });
    
    };

    document.getElementById('logoutButton')?.addEventListener('click', function () {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    });


// Cargar y mostrar usuarios en el panel
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userTableBody = document.querySelector('#userTable tbody');
    userTableBody.innerHTML = ''; // Limpiar tabla antes de generar

    // Generar filas de la tabla
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn-delete" data-index="${index}">Eliminar</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });

    // Verificar el rol del usuario autenticado
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser.role === 'operator') {
        // Deshabilitar botones de eliminar para operadores
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.disabled = true; // Deshabilitar botón
            button.style.cursor = 'not-allowed'; // Cambiar cursor para indicar que no se permite
        });
    }

    // Agregar eventos a los botones de eliminar solo si es admin
    if (loggedInUser.role === 'admin') {
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', deleteUser);
        });
    }
}



// Eliminar usuario
function deleteUser(e) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser.role !== 'admin') {
        alert('No tienes permiso para realizar esta acción.');
        return;
    }

    const index = e.target.getAttribute('data-index');
    const users = JSON.parse(localStorage.getItem('users')) || [];

    users.splice(index, 1); // Eliminar usuario del array
    localStorage.setItem('users', JSON.stringify(users)); // Actualizar en localStorage

    loadUsers(); // Recargar la tabla
}

// Validaciones
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    return usernameRegex.test(username);
}

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
}

// Barra de búsqueda
document.getElementById('searchBar')?.addEventListener('input', function (e) {
    const searchValue = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#userTable tbody tr');

    rows.forEach(row => {
        const username = row.querySelector('td:first-child').textContent.toLowerCase();
        if (username.includes(searchValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});
document.getElementById('searchBar')?.addEventListener('input', function (e) {
    const searchValue = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#userTable tbody tr');

    rows.forEach(row => {
        const username = row.querySelector('td:first-child').textContent.toLowerCase();
        row.style.display = username.includes(searchValue) ? '' : 'none';
    });
});
function encodePassword(password) {
    return btoa(password); // Ofuscar en Base64
}

function decodePassword(encodedPassword) {
    return atob(encodedPassword); // Decodificar
}
document.getElementById('registerForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const message = document.getElementById('registerMessage');

    if (!isValidUsername(username)) {
        message.textContent = 'El nombre de usuario debe tener entre 3 y 15 caracteres.';
        message.style.color = 'red';
        return;
    }

    if (users.some(user => username.startsWith(user.username))) {
        message.textContent = 'El nombre de usuario es demasiado similar a uno existente.';
        message.style.color = 'red';
        return;
    }

    if (!isValidPassword(password)) {
        message.textContent = 'La contraseña debe tener al menos 8 caracteres, un número y un carácter especial.';
        message.style.color = 'red';
        return;
    }

    users.push({ username, password: encodePassword(password), role });
    localStorage.setItem('users', JSON.stringify(users));

    message.textContent = 'Registro exitoso. Redirigiendo al inicio de sesión...';
    message.style.color = 'green';
    setTimeout(() => window.location.href = 'index.html', 1500);
});
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const message = document.getElementById('loginMessage');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username && decodePassword(user.password) === password);

   

    localStorage.setItem('loggedInUser', JSON.stringify(user));
    message.textContent = 'Inicio de sesión exitoso. Redirigiendo al panel...';
    setTimeout(() => window.location.href = 'panel.html', 1500);
});
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userTableBody = document.querySelector('#userTable tbody');
    userTableBody.innerHTML = '';

    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn-delete" data-index="${index}">Eliminar</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser.role === 'operator') {
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.disabled = true;
            button.style.cursor = 'not-allowed';

            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip-text';
            tooltip.textContent = 'Solo los administradores pueden eliminar usuarios.';
            const wrapper = document.createElement('div');
            wrapper.className = 'tooltip';
            button.parentNode.insertBefore(wrapper, button);
            wrapper.appendChild(button);
            wrapper.appendChild(tooltip);
        });
    }

    if (loggedInUser.role === 'admin') {
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', deleteUser);
        });
    }
}
document.getElementById('searchBar')?.addEventListener('input', function (e) {
    const searchValue = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#userTable tbody tr');

    rows.forEach(row => {
        const username = row.querySelector('td:first-child').textContent.toLowerCase();
        row.style.display = username.includes(searchValue) ? '' : 'none';
    });
});
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userTableBody = document.querySelector('#userTable tbody');
    const totalUsers = document.getElementById('totalUsers');
    const lastUser = document.getElementById('lastUser');

    // Limpiar tabla antes de llenarla
    userTableBody.innerHTML = '';

    // Llenar tabla con los usuarios
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td><button class="btn-delete" data-index="${index}">Eliminar</button></td>
        `;
        userTableBody.appendChild(row);
    });

    // Actualizar estadísticas
    totalUsers.textContent = users.length; // Total de usuarios
    lastUser.textContent = users.length > 0 ? users[users.length - 1].username : 'N/A'; // Último usuario registrado

    // Agregar eventos a botones de eliminar (si corresponde)
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', deleteUser);
    });
}
document.getElementById('registerForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    const message = document.getElementById('registerMessage');
    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (!username || !password) {
        message.textContent = 'Por favor, completa todos los campos.';
        message.style.color = 'red';
        return;
    }

    if (users.some(user => user.username === username)) {
        message.textContent = 'El usuario ya existe.';
        message.style.color = 'red';
        return;
    }

    // Agregar usuario al array y guardar en localStorage
    users.push({ username, password, role });
    localStorage.setItem('users', JSON.stringify(users));

    message.textContent = 'Usuario registrado con éxito.';
    message.style.color = 'green';

    // Redirigir al inicio de sesión
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});
