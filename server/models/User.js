// import mongoose from "mongoose";
// const userSchema=new mongoose.Schema({
//     _id:{type:String,required:true},
//     name:{type:String,required:true},
//     email:{type:String,required:true},
//     image:{type:String,required:true},  
// })

// const User=mongoose.model('User',userSchema)
// export default User;




import mongoose from "mongoose";
import mysql from 'mysql2/promise';

// MongoDB Schema (your existing code)
const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// MySQL Connection Configuration
const mysqlConfig = {
    host: 'localhost',
    user: 'movie_ticket', // replace with your MySQL username
    password: 'gagan@000777', // replace with your MySQL password
    database: 'myApp' // your database name
};

// Create MySQL connection pool for better performance
const mysqlPool = mysql.createPool(mysqlConfig);

// Enhanced User class with dual database support
class UserService {
    
    // Create user in both databases
    static async createUser(userData) {
        const { _id, name, email, image } = userData;
        
        try {
            // Save to MongoDB (existing functionality)
            const mongoUser = new User({ _id, name, email, image });
            const mongoResult = await mongoUser.save();
            
            // Save to MySQL (id will auto-increment)
            const mysqlQuery = `
                INSERT INTO users (name, email, image) 
                VALUES (?, ?, ?)
            `;
            const mysqlResult = await mysqlPool.execute(mysqlQuery, [name, email, image]);
            
            console.log('User created in both databases');
            return {
                success: true,
                mongodb: mongoResult,
                mysql: { 
                    insertId: mysqlResult[0].insertId,
                    affectedRows: mysqlResult[0].affectedRows
                }
            };
            
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    
    // Find user by ID from both databases
    static async findUserById(userId) {
        try {
            // Get from MongoDB
            const mongoUser = await User.findById(userId);
            
            // Get from MySQL (using auto-increment id)
            const mysqlQuery = 'SELECT * FROM users WHERE id = ?';
            const [mysqlRows] = await mysqlPool.execute(mysqlQuery, [userId]);
            const mysqlUser = mysqlRows[0];
            
            return {
                mongodb: mongoUser,
                mysql: mysqlUser
            };
            
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }
    
    // Find user by email
    static async findUserByEmail(email) {
        try {
            // Get from MongoDB
            const mongoUser = await User.findOne({ email });
            
            // Get from MySQL
            const mysqlQuery = 'SELECT * FROM users WHERE email = ?';
            const [mysqlRows] = await mysqlPool.execute(mysqlQuery, [email]);
            const mysqlUser = mysqlRows[0];
            
            return {
                mongodb: mongoUser,
                mysql: mysqlUser
            };
            
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }
    
    // Update user in both databases
    static async updateUser(userId, updateData) {
        try {
            // Update in MongoDB
            const mongoResult = await User.findByIdAndUpdate(userId, updateData, { new: true });
            
            // Update in MySQL
            const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updateData);
            const mysqlQuery = `UPDATE users SET ${fields} WHERE id = ?`;
            const mysqlResult = await mysqlPool.execute(mysqlQuery, [...values, userId]);
            
            return {
                success: true,
                mongodb: mongoResult,
                mysql: mysqlResult[0]
            };
            
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
    
    // Delete user from both databases
    static async deleteUser(userId) {
        try {
            // Delete from MongoDB
            const mongoResult = await User.findByIdAndDelete(userId);
            
            // Delete from MySQL
            const mysqlQuery = 'DELETE FROM users WHERE id = ?';
            const mysqlResult = await mysqlPool.execute(mysqlQuery, [userId]);
            
            return {
                success: true,
                mongodb: mongoResult,
                mysql: mysqlResult[0]
            };
            
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
    
    // Get all users from MySQL (showing tabular data)
    static async getAllUsersFromMySQL() {
        try {
            const [rows] = await mysqlPool.execute('SELECT * FROM users ORDER BY created_at DESC');
            return rows;
        } catch (error) {
            console.error('Error getting users from MySQL:', error);
            throw error;
        }
    }
    
    // Migrate existing MongoDB users to MySQL
    static async migrateUsersToMySQL() {
        try {
            const mongoUsers = await User.find({});
            
            for (const user of mongoUsers) {
                const mysqlQuery = `
                    INSERT IGNORE INTO users (name, email, image) 
                    VALUES (?, ?, ?)
                `;
                await mysqlPool.execute(mysqlQuery, [user.name, user.email, user.image]);
            }
            
            console.log(`Migrated ${mongoUsers.length} users to MySQL`);
            return { success: true, migrated: mongoUsers.length };
            
        } catch (error) {
            console.error('Error migrating users:', error);
            throw error;
        }
    }
}

// Export both the original model and the enhanced service
export default User;
export { UserService };