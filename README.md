# Grocery Store

A modern grocery store management system with user authentication, product management, and order processing.

## Features

- User authentication (registration and login)
- Product browsing with categories and subcategories
- Shopping cart functionality
- Admin panel for product and user management
- Order processing and tracking
- Responsive design using Bootstrap

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache/Nginx)
- Modern web browser

## Installation

1. Clone the repository:
```bash
git clone https://github.com/hkayy33/Store.git
cd Store
```

2. Create a MySQL database and import the schema:
```bash
mysql -u your_username -p your_database_name < src/config/schema.sql
```

3. Configure the database connection:
   - Open `src/config/database.php`
   - Update the database credentials:
     ```php
     private $host = "localhost";
     private $db_name = "your_database_name";
     private $username = "your_username";
     private $password = "your_password";
     ```

4. Set up your web server:
   - Point your web server's document root to the `public` directory
   - Ensure the web server has write permissions for the `public/images` directory

5. Access the application:
   - Open your web browser and navigate to your server's URL
   - Default admin credentials:
     - Username: admin
     - Password: admin123

## Project Structure

```
GroceryStore/
├── public/                 # Publicly accessible files
│   ├── css/               # CSS stylesheets
│   ├── js/                # JavaScript files
│   ├── images/            # Product images
│   ├── api/               # API endpoints
│   └── *.php              # Public PHP files
├── src/                   # Source code
│   ├── config/            # Configuration files
│   ├── controllers/       # Controller classes
│   ├── models/            # Model classes
│   └── views/             # View templates
├── admin/                 # Admin panel files
└── README.md              # Project documentation
```

## Security Features

- Password hashing using PHP's password_hash()
- Prepared statements for all database queries
- Input validation and sanitization
- Session-based authentication
- Role-based access control

## License

This project is licensed under the MIT License. 