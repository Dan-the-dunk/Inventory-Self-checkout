const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/selfcheckout');

// Connection Status
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.error('Connection error:', error);
});


// Define User Schema
const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

async function updatePasswords() {
    try {
        const users = await User.find({});
        
        for (let user of users) {
            if (!user.password.startsWith('$2b$')) { // Check if password is already hashed
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
                console.log(`Updated password for: ${user.username}`);
            } else {
                console.log(`Password already hashed for: ${user.username}`);
            }
        }

        console.log('Password update process completed.');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error updating passwords:', error);
    }
}

updatePasswords();
