# Prerequisites:

1) Node: https://nodejs.org/en

2) MySQL server: https://dev.mysql.com/downloads/mysql/

3) MySQL workbench (other alternatives exist but this is the one I (Jason) used): https://dev.mysql.com/downloads/workbench/

    - Tutorial for MySQL installation: https://www.youtube.com/watch?v=u96rVINbAUI

4) Make sure to have the same configuration for mysql local server: https://imgur.com/yFqNlj4 

5) Make sure your server is running:

Mac: Go to system preferences and click MySQL Wokrbench. You can then see if the server is running.

Windows: Search up Services and check the status of MySql.

Linux: 

check status: ```systemctl status mysql.service```

turn on server: ```sudo systemctl start mysql.service```

# Install packages (see package.json for reference)

```npm install```

# See if you have the packages installed:

```npm list```

# VS code extensions used:

-Live Saas Compiler (for customizing bootstrap)

-HTML CSS Support (helps with coding)

For live Saas Compiler, you will want to change the output css file to go to the public css directory:
https://www.youtube.com/watch?v=V9QvH51XZVM&t=173s Once done you can click watch saas located in the blue footer bar

# To run the server:

Note: Import the database and set your password in app.js before starting the server: https://www.youtube.com/watch?v=7Cbm5vPQvNI 
You can also simply copy and paste the code from tuffyasks.sql and run it directly in workbench as well

```npm run devStart ``` 

Access website with the following URL (directed to login for now): http://localhost:3000/login
