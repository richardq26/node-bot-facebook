require("dotenv").config();

const app=require("./app");
const puerto= app.get("port");

app.listen(puerto, ()=>{
    console.log('Servidor en puerto: ' + puerto);
})