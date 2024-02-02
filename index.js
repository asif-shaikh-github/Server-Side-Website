const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const uuid = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended : true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'helloworld'
});



let  getRandomUser = () => {
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
    ];
}


app.listen("8080", () => {
    console.log("server is listening to port 8080");
});

//Home route
app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM user;`;
    try{
            conn.query(q, (err, result) => {
            if(err) throw err;
            let count = result[0]["count(*)"]
            res.render("home.ejs", { count });
            });
        }catch(err){
            console.log(err);
            res.send("Some error occured");
        };
});

//Show users route
app.get("/user", (req, res) => {
    let q = `SELECT * FROM user;`;
    try{
        conn.query(q, (err, users) => {
            if(err) throw err;
            res.render("showuser.ejs", { users });
        })
    }catch(err){
        console.log(err);
        res.send("Some error in Database");
    }
});

//Edit Route
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}';`;
    try{
        conn.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];
            res.render("edit.ejs", { user });
        })
    }catch(err){
        console.log(err);
        res.send("Some error occured");
    }
});

//Update Route
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let {password : formPass, username : newUsername} = req.body;
    let q = `SELECT * FROM user WHERE id='${id}';`;
    try{
        conn.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];
            if(formPass !== user.password){
                res.send("Wrong Password");
            }else{
                let q2 = `UPDATE user SET username = '${newUsername}' WHERE id='${id}';`
                conn.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect("/user");
                })
            }})
    }catch(err){
        console.log(err);
        res.send("Some error occured");
    }
});

//NewUserInformation Route
app.post("/user/adduserinfo", (req, res) => {
    res.render("adduserinfo.ejs");
});

//AddUser Route
app.post("/user", (req, res) => {
    let { email : newEmail, username: newUsername, password : firstPass, confirmPassword : secondPass } = req.body;
    const id = uuid.v4();
    const q = `INSERT INTO user(id, username, email, password) VALUES (?,?,?,?)`
    if(firstPass != secondPass){
        res.send("Password and confirm Password are not same");
    }else{
        try{
            conn.query(q, [id, newUsername, newEmail, firstPass], (err, result) => {
                if(err) throw err;
                console.log(result);
                res.redirect("/user");
            })
        }catch(err){
            console.log(err);
            res.send("Some error occured in Database");
        }
    }
});

//ConfirmDetails Route
app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}';`;
    try{
        conn.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];
            res.render("deleteuser.ejs", { user });
        })
    }catch(err){
        console.log(err);
        res.send("Some error occured");
    }
});

// Delete User Route
app.delete("/user/:id", (req, res) => {
    let { id } = req.params;
    let { email, password } = req.body;
    console.log(id);
    console.log(req.body);
    let deleteQuery = `DELETE FROM user WHERE id = '${id}' AND email = '${email}' AND password = '${password}';`;

    conn.query(deleteQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Some error occurred in Database");
        }
        if (result.affectedRows === 0) {
            return res.send("User not found or wrong credentials");
        }
        console.log("User deleted successfully");
        res.redirect("/user");
    });
});


// app.post("/user/delete", (req, res) => {
//     let { id : id, email : newemail, password : newpassword } = req.body;
//     let q = `DELETE FROM user WHERE id = '${id}';`;
//     if(newemail != user.email || newpassword != user.password){
//         res.send("Wrong Email or Password");
//     }else{
//         try{
//             conn.query(q, (err, result) => {
//                 if(err) throw err;
//                 let user = result[0];
//                 console.log(result);
//                 res.redirect("/user");
//             })}catch(err){
//                 console.log(err);
//                 res.send("Some error occured in Database");
//             }
//         }
//     });

// Inserting New Data
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// let data = [];
// for(let i=1;i<=100;i++){
//     data.push(getRandomUser()); // Generating 100 users
// }

// try{
//     conn.query(q, [data], (err, result) => {
//     if(err) throw err;
//     console.log(result);
//     });
// }catch(err){
//     console.log(err);
// };

// conn.end();