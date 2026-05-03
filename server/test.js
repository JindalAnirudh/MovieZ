import { UserService } from './models/User.js';

async function testUser() {
    try {
        // Create a test user
        const result = await UserService.createUser({
            _id: 'test123',
            name: 'Test User',
            email: 'test@example.com',
            image: 'test.jpg'
        });
        
        console.log('Success! User created in both databases:', result);
        
        // Check MySQL data
        const mysqlUsers = await UserService.getAllUsersFromMySQL();
        console.log('MySQL users:', mysqlUsers);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testUser();