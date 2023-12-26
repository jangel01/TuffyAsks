# Assignment Prompt

CPSC 362 - Foundations of Software Engineering 

An application where CSUF students can post questions and answers for
academic purposes based on different courses. Only CSUF students should be
able to register or login to this application (based on xxxx@csu.fullerton.edu).
These questions and answers should be sorted based on courses. Each
registered user can then post a new question in any course he wishes to or post
answer to an existing question. Each registered user can also add a new course
to the already existing course list. Questions and answers once posted cannot
be deleted or modified.

# Prerequisites for the Project to work:

1) Node: https://nodejs.org/en

2) MySQL server: https://dev.mysql.com/downloads/mysql/

3) MySQL workbench (other alternatives exist but this is the one I (Jason) used): https://dev.mysql.com/downloads/workbench/

    - Tutorial for MySQL installation: https://www.youtube.com/watch?v=u96rVINbAUI

4) Make sure to have the same configuration for mysql local server: https://imgur.com/yFqNlj4 

5) Make sure your server is running:

   - Mac: Go to system preferences and click MySQL Wokrbench. You can then see if the server is running.

   - Windows: Search up Services and check the status of MySql.

   - Linux: 
        - check status: ```systemctl status mysql.service``` or ```sudo systemctl status mysql```
        - turn on server: ```sudo systemctl start mysql.service``` or ```sudo systemctl start mysql```

# Install Packages (see package.json for reference)

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

# Screenshots

(This project is not mobile responsive)

![Screenshot 2023-12-25 at 17-02-29 Sign Up](https://github.com/jangel01/TuffyAsks/assets/60250253/bfed6eea-30bf-445c-9707-f30845930427)
![Screenshot 2023-12-25 at 17-01-15 Sign In](https://github.com/jangel01/TuffyAsks/assets/60250253/76d12bb7-5220-4d69-825e-c7f6ebc3d834)
![Screenshot 2023-12-25 at 17-03-10 Add a Course](https://github.com/jangel01/TuffyAsks/assets/60250253/5bedf00e-4d45-4170-bb44-fa881a8824a1)
![Screenshot 2023-12-25 at 17-03-29 Add a Course](https://github.com/jangel01/TuffyAsks/assets/60250253/1df102bf-b96a-4b84-8970-fedb6bc2dcc0)
![Screenshot 2023-12-25 at 17-04-38 Add a Course](https://github.com/jangel01/TuffyAsks/assets/60250253/f7e45108-3968-4b80-9cb3-7d7a5469fd71)
![Screenshot 2023-12-25 at 17-05-23 Add a Course](https://github.com/jangel01/TuffyAsks/assets/60250253/b33c4662-2b66-4d33-9678-595166ffe04b)
![Screenshot 2023-12-25 at 17-05-57 Add a Course](https://github.com/jangel01/TuffyAsks/assets/60250253/de2f9900-2353-4aeb-9243-aed70a35b78e)
