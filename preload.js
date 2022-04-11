const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const os = require('os')
const { ipcRenderer } = require('electron')
const db_path = path.join(os.homedir(), 'mamodb.db')


const db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to database.');
  });



function initApp(){
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT ,user_name TEXT NOT NULL,last_name TEXT NOT NULL,datebirth TEXT NOT NULL,phonenumber TEXT NOT NULL UNIQUE,adress TEXT NOT NULL ,created_at TEXT DEFAULT CURRENT_TIMESTAMP )",(err)=>{
        if (err) {
            console.log(err);
        }else{
            console.log("Created users Table")
        }
    })
    show_users()
}

function add_user() {
    let user_name = document.getElementById('user_name').value
    let user_lasname = document.getElementById('user_lastname').value
    let user_datebirth = document.getElementById('user_datebirth').value
    let user_phonenumber = String(document.getElementById('user_phonenumber').value)
    let user_adress = document.getElementById('user_adress').value
    if (user_name && user_lasname && user_datebirth && user_phonenumber ) {
        db.run("INSERT INTO users (user_name,last_name,datebirth,phonenumber,adress) VALUES (?,?,?,?,?)",user_name,user_lasname,user_datebirth,user_phonenumber,user_adress,(err)=>{
            if (err) {
                console.log(err);
            } else {
                console.log("Add User Success");
                document.getElementById('user_name').value = ""
                document.getElementById('user_lastname').value = ""
                document.getElementById('user_datebirth').value = ""
                document.getElementById('user_phonenumber').value = ""
                document.getElementById('user_adress').value = ""
                show_users()
            }
        })
    }
  
}

function show_users() {
    let limit = document.getElementById("limit_pagination").value
    console.log(`Pagination Limit:${limit}`);
    db.all("SELECT * FROM users ORDER BY created_at DESC LIMIT ?",limit,(err,users)=>{
        if (err) {
            console.log(err);
        }else{
            console.log(users.length);
            document.getElementById("users_here").innerHTML = ``
            console.log(users);
            users.forEach(user => {
                document.getElementById("users_here").innerHTML += 
                `
                <tr>
                <td>
                ${user.user_name}
                </td>
                
                <td>
                ${user.last_name}
                </td>
                
                <td>
                ${user.datebirth}
                </td>
                
                <td>
                ${user.phonenumber}
                </td>

                <td>
                ${user.adress}
                </td>

                <td>
                <input class="form-check-input" type="checkbox" value="${user.id}" id="${user.id}" />
              </td>

                </tr>
                `
            });
        }
    })
}

function delete_users() {
    const checked = document.querySelectorAll('input[type="checkbox"]:checked')
    selected = Array.from(checked).map(x => x.value)
    selected.forEach(user => {
        delete_user(user)
    });
}

function shecked(){
    const checked = document.querySelectorAll('input[type="checkbox"]')
    selected = Array.from(checked).map(x => x)
    selected.forEach(a => {
        a.checked = true
    });
}

function delete_user(id) {
    db.run("DELETE  FROM users WHERE id=?",id,(err)=>{
        if (err) {
            console.log(err);
        } else {
            console.log("Deleted User With Success");
            show_users()
        }
    })
}
function search() {
    let keyword = document.getElementById("search_input").value
    db.all("SELECT * FROM users WHERE user_name LIKE ?  OR last_name LIKE  ?  OR phonenumber LIKE  ? ",`%${keyword}%`,`%${keyword}%`,`%${keyword}%`,(err,users)=>{
        if (err) {
            console.log(err);
        }else{
            console.log(users);
            document.getElementById("users_here").innerHTML = ``
            console.log(users);
            users.forEach(user => {
                document.getElementById("users_here").innerHTML += 
                `
                <tr>
                <td>
                ${user.user_name}
                </td>
                
                <td>
                ${user.last_name}
                </td>
                
                <td>
                ${user.datebirth}
                </td>
                
                <td>
                ${user.phonenumber}
                </td>

                <td>
                ${user.adress}
                </td>

                <td>
                <input class="form-check-input" type="checkbox" value="${user.id}" id="${user.id}" />
              </td>

                </tr>
                `
            });
        }
    })
}


window.addEventListener('DOMContentLoaded', () => {
    initApp()
    document.getElementById('limit_pagination').addEventListener('input',()=>{
        show_users()
    })
    document.getElementById("add_user_btn").addEventListener('click',()=>{
        add_user()
    })
    document.getElementById("delete_users_selected").addEventListener('click',()=>{
        delete_users()
    })
    document.getElementById("search_input").addEventListener('input',()=>{
        search()
    })

/*
    for (let i = 0; i < 1000; i++) {
        db.run("INSERT INTO users (user_name,last_name,datebirth,phonenumber,adress) VALUES (?,?,?,?,?)","user_name","user_lasname","user_datebirth",i,"user_adress",(err)=>{
            if (err) {
                console.log(err);
            } else {
                console.log("Add User Success");
                show_users()
            }
        })
        
    }
 */
})

window.onerror = function(msg, url, line, col, error) {
    let error_message = {
      message:msg,
      url_file:url,
      line_code:line,
      column:col,
      error:error,
    } 
    ipcRenderer.send("error",error_message)
  }
  