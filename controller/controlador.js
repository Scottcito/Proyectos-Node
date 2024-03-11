const express = require('express');
const bodyParser =require('body-parser');
/* const mysql =require('mysql'); */
const path=require('path')
const mysql2 =require('mysql2/promise');
const session=require('express-session');
const { error } = require('console');
const { createConnection } = require('net');
const controlador = express()

//Configurar middleware


controlador.use(bodyParser.urlencoded({extended:true}));
controlador.use(bodyParser.json());
controlador.use(express.static(path.join(__dirname)));
controlador.use('/css', express.static(path.join(__dirname,'../vistas/css')));
controlador.use('/imagenes', express.static(path.join(__dirname,'../vistas/imagenes')));
controlador.use(session({
    secret:'David', //Palabra secreta
    resave:false, //No guarda la sesión
    saveUninitialized:false //Necesita una sesión por cada usuario
}))
//Mysql Versión 1.0
/* const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'manzanas'
})
db.connect((err)=>{
    if(err){
        console.error('Error al conectar a la base de datos'+ err.stack)
        return;
    }
    console.log('Conexión exitosa a la base de datos')
}); */
//Mysql Versión 2.
//const db=mysql
const db2=({
    host:'localhost',
    user:'root',
    password:'',
    database:'manzanitas',
    timezone: 'America/Bogota'
});

controlador.post('/crear', async (req, res) => {
    const { Tipo_Documen, Documento, Nombres, Apellidos, Tel, Correo_Elec, Ciudad, Direccion, Ocupacion ,FkManzana} = req.body;
    try {
        // Verificador de usuario
        const connectionI=await mysql2.createConnection(db2);
        // Aqui ira la comparativa de roles de los perfiles de los usuarios
        const [indicador] = await connectionI.execute('SELECT * FROM mujeres WHERE Tipo_Documen=? AND Documento= ?', [Tipo_Documen, Documento]);
        if (indicador.length > 0) {
            res.status(409).sendFile(__dirname, '../vistas/HTML/IniciarSesion.html', '../vistas/css/index.css');
        } else {
            await connectionI.execute('INSERT INTO mujeres (Tipo_Documen, Documento, Nombres, Apellidos, Tel, Correo_Elec, Ciudad, Direccion, Ocupacion,FkManzana) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [Tipo_Documen, Documento, Nombres, Apellidos, Tel, Correo_Elec, Ciudad, Direccion, Ocupacion,FkManzana]);
                const rutaInicio = path.join(__dirname, '../vistas/HTML/IniciarSesion.html');
                res.sendFile(rutaInicio);
        }
        await connectionI.end();
    } 
    catch (error) {
        console.error('Error en el servidor: ', error);
        res.status(500).sendFile(__dirname, '../vistas/HTML/Registrarse.html' +'../vistas/css/index.css');
    }
})
    //Ruta para manejar Login
controlador.post('/iniciar', async(req,res)=>{
    const{Tipo_Documen,Documento}=req.body
    try{
        //Verifica credenciales
        const connectionI=await mysql2.createConnection(db2);
        // Aqui ira la comparativa de roles de los perfiles de los usuarios
        const [indicador]=await connectionI.execute('SELECT * FROM mujeres WHERE Tipo_Documen=? AND Documento= ?',[Tipo_Documen,Documento])
        console.log(indicador)
        if(indicador.length>0){
            req.session.usuario=indicador[0].Nombres;
            req.session.Documento=Documento;
            if(indicador[0].ROL=="administrador"){
                res.sendFile(path.join(__dirname,'../vistas/HTML/admin.html'));
            }
            else{
                const usuario={Nombres:indicador[0].Nombres}
                console.log(usuario)
                res.locals.usuario=usuario;
                res.sendFile(path.join(__dirname,'../vistas/HTML/usuario.html'))
            }
        }
        else{
                res.status(409).send(`<script>
                alert('Usuario no encontrado')
                window.location='../vistas/HTML/iniciarSe.html';
                </script>`)
        }
        await connectionI.end();
    }
    catch(error){
        console.error('Error en el servidor', error)
        res.status(500).send(`<script>
            window.onload= function(){
                alert('Error en el servidor');
            window.location.href='http://127.0.0.1:5500/vistas/html/';
            }
            </script>`)
        }
})
controlador.post('/obtener-usuario',(req,res)=>{
    const usuario=req.session.usuario;
    if(usuario){
        res.json({Nombres:usuario});
        res.sendFile(__dirname,'../vistas/HTML/usuario.html')
    }
    else{
        res.status(401).send('Usuario no autenticado')
    }
    
})
controlador.post('/obtener-admin',(req,res)=>{
    const usuario=req.session.usuario;
    if(usuario){
        res.json({Nombres:usuario});
        res.sendFile(__dirname,'../vistas/HTML/admin.html')
    }
    else{
        res.status(401).send('Usuario no autenticado')
    }
    
})
controlador.post('/obtener-servicio-usuario',async(req,res)=>{
    const usuario=req.session.usuario;
    const Documento=req.session.Documento;
    console.log(usuario,Documento)
    try{
        const connectionI=await mysql2.createConnection(db2);
        const[serviciosData]=await connectionI.execute('SELECT servicio.Nom_Serv FROM mujeres INNER JOIN manzanas ON mujeres.FkManzana = manzanas.Cod_Manzana INNER JOIN manzanas_servicio on manzanas.Cod_Manzana =manzanas_servicio.Id_Manzana1 INNER JOIN servicio ON manzanas_servicio.Id_Servicio2=servicio.Cod_Serv WHERE mujeres.Documento=?',[Documento])
        console.log(serviciosData)
        res.json({servicios: serviciosData.map(row=>row.Nom_Serv)})//Listar los datos en lo que vayan llegando
        await connectionI.end();
    }
    catch{
        console.error('Error en el servidor', error)
        res.status(500).send('Error en el servidor')
    }
})
controlador.post('/guardar-servicio-usuario', async(req,res)=>{
    const {servicios, fechaHora}=req.body
    const Documento=req.session.Documento;
    const connectionI=await mysql2.createConnection(db2);
    console.log(servicios)
    const [SacarID]=await connectionI.execute('SELECT Id_Mujer FROM mujeres WHERE Documento=?',[Documento])
    const [sacarCodServ]=await connectionI.query('SELECT servicio.Cod_Serv FROM servicio WHERE servicio.Nom_Serv=?',[servicios])
    console.log(SacarID)
    console.log(sacarCodServ)
    try{
        for(const servicio of servicios){
            await connectionI.execute('INSERT INTO solicitudes (servicio,fkMujeresSolicitudes,Fecha) VALUES (?,?,?)',[sacarCodServ[0].Cod_Serv,SacarID[0].Id_Mujer,fechaHora])    
            res.status(200).send('Chipi chapa')
        }
        await connectionI.end();
        }
        catch{
            console.error('Error en el servidor', error)
            res.status(500).send('Error en el servidor')
        }
})
controlador.post('/buscar-servicios-usuarios', async(req,res)=>{
    const Documento=req.session.Documento;
    try{
        const connectionI=await mysql2.createConnection(db2);
        const [listasServUsuario]=await connectionI.execute('SELECT servicio.Nom_Serv,solicitudes.Fecha,servicio.Cod_Serv FROM solicitudes INNER JOIN mujeres ON mujeres.Id_Mujer = solicitudes.fkMujeresSolicitudes INNER JOIN manzanas ON manzanas.Cod_Manzana = mujeres.FkManzana INNER JOIN manzanas_servicio ON manzanas_servicio.Id_Manzana1= manzanas.Cod_Manzana INNER JOIN servicio ON servicio.Cod_Serv= manzanas_servicio.Id_Servicio2 WHERE solicitudes.servicio=servicio.Cod_Serv AND mujeres.Documento=?',[Documento])
      
        console.log(listasServUsuario)
     
        res.json({
            lists_ServUsuario:listasServUsuario.map(row=>([
                row.Nom_Serv,row.Fecha,row.Cod_Serv
            ]))
        });
        await connectionI.end();
    }
    catch{
        console.error('Error en el servidor', error);
        res.status(500).send('Error en el servidor')
    }
    
})
controlador.delete('/eliminar-solicitudes',async(req,res)=>{
    const {deleteid,fecha_Servi}=req.body;
    
    try{
        const connectionI=await mysql2.createConnection(db2);
                const [consultaServi]=await connectionI.execute('SELECT Cod_Solicitud FROM solicitudes WHERE Fecha=?',[fecha_Servi])
                const [DeleteButt]=await connectionI.execute('DELETE FROM solicitudes WHERE servicio=? AND Fecha=?',[deleteid,fecha_Servi])
                console.log(consultaServi,DeleteButt)
                res.json({DeleteButt})
                await connectionI.end();
       
    }
    catch{
        console.error('Error en el servidor',error)
        res.status(500).json({ error: 'Error en el servidor' });
       
    }
})
controlador.post('/obtener-usuarios',async(req,res)=>{
try{
    const connectionI=await mysql2.createConnection(db2);
    const [consultaUsers]=await connectionI.execute('SELECT * FROM Mujeres')
        res.json({
            lisusuariosadmin: consultaUsers.map(row => ({
                Id_Mujer: row.Id_Mujer,
                Tipo_Documen: row.Tipo_Documen,
                Documento: row.Documento,
                Nombres: row.Nombres,
                Apellidos: row.Apellidos,
                Tel: row.Tel,
                Correo_Elec: row.Correo_Elec,
                Ciudad: row.Ciudad,
                Direccion: row.Direccion,
                Ocupacion: row.Ocupacion
            }))
        })
        
        await connectionI.end();
}
catch(error){
        console.error('Error en el servidor',error)
        res.status(500).json({ error: 'Error en el servidor' }); 
}
})

controlador.post('/obtener-manzanas',async(req,res)=>{
    try{
        const connectionI=await mysql2.createConnection(db2);
        const [consultaManzanas]=await connectionI.execute('SELECT * FROM Manzanas')
        res.json({
                lisManzanasadmin: consultaManzanas.map(row => ({
                    Cod_Manzana: row.Cod_Manzana,
                    Nombre_Manzana: row.Nombre_Manzana,
                    Localidad: row.Localidad,
                    Direccion: row.Direccion,
                    Municipio: row.Municipio
                }))
            })
            await connectionI.end();
    }
    catch(error){
            console.error('Error en el servidor',error)
            res.status(500).json({ error: 'Error en el servidor' }); 
    }
})
controlador.post('/obtener-servicios',async(req,res)=>{
    try{
        const connectionI=await mysql2.createConnection(db2);
        const [consultaServicios]=await connectionI.execute('SELECT * FROM servicio')
        res.json({
            lisServiciosadmin: consultaServicios.map(row => ({
                Cod_Serv: row.Cod_Serv,
                Nom_Serv: row.Nom_Serv,
                Descripc: row.Descripc,
                Categ_Serv: row.Categ_Serv,
                Tipo_Serv: row.Tipo_Serv
            }))
        })
            await connectionI.end();
    }
    catch(error){
            console.error('Error en el servidor',error)
            res.status(500).json({ error: 'Error en el servidor' }); 
    }
});  
controlador.post('/cerrar-sesion',(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.error('Error al cerrar sesión')
            res.status(500).json('Error al cerrar sesión');
        }
        else{
            res.sendFile(path.join(__dirname,'../vistas/HTML/cerrarsesion.html'))
        }
    })
});
controlador.post('/editar-usuario/:Id_Mujer',async(req,res)=>{
    try {
        const Id_Mujer = req.params.Id_Mujer;
        const { Tipo_Documen, Tel, Correo_Elec, Ciudad, Direccion, FkManzana } = req.body;
        const connectionI = await mysql2.createConnection(db2);
        const [consultaUsuario] = await connectionI.execute('SELECT * FROM mujeres WHERE Id_Mujer = ?', [Id_Mujer]);
        if (consultaUsuario.length > 0) {
            res.sendFile(path.join(__dirname, '../Vistas/HTML/actualizar.html'));
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await connectionI.end();
    } catch (error) {
        console.error('Error en el servidor', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
controlador.post('/editar-usu/:Id_Mujer', async (req, res) => {
    try {
        const Id_Mujer = req.params.Id_Mujer;
        const { Tipo_Documen, Tel, Correo_Elec, Ciudad, Direccion, FkManzana } = req.body;
        const connectionI = await mysql2.createConnection(db2);
        const [ActualizarUsuarios] = await connectionI.execute('UPDATE mujeres SET Tipo_Documen=?, Tel=?, Correo_Elec=?, Ciudad=?, Direccion=?, FkManzana=? WHERE Id_Mujer=?', [Tipo_Documen, Tel, Correo_Elec, Ciudad, Direccion, FkManzana, Id_Mujer]);
        console.log(ActualizarUsuarios)
        await connectionI.end();
        res.status(201).send(`
            <script>
                window.location="../Vistas/html/adminn.html";
            </script>
        `);
    } catch (error) {
        // Maneja los errores y envía una respuesta de error al cliente
        console.error('Error en el servidor', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
controlador.post('/editar-servicios/:Cod_Servicio', async (req, res) => {
    try {
        const Cod_Servicio = req.params.Cod_Servicio;
        const { Nom_Serv, Descripc, Categ_Serv, Tipo_Serv } = req.body;
        const connection = await mysql2.createConnection(db2);
        const [consultaServicio] = await connection.execute('SELECT * FROM servicio WHERE Cod_Serv = ?', [Cod_Servicio]);
        if (consultaServicio.length > 0) {
            res.sendFile(path.join(__dirname, '../Vistas/HTML/actualizarServ.html'));
        } else {
            res.status(404).json({ error: 'Servicio no encontrado' });
        }
        await connection.end();
    } catch (error) {
        console.error('Error en el servidor', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

controlador.post('/editar-servicio/:Cod_Servicio', async (req, res) => {
    try {
        const Cod_Servicio = req.params.Cod_Servicio;
        const { Nom_Serv, Descripc, Categ_Serv, Tipo_Serv} = req.body;
        const connectionI = await mysql2.createConnection(db2);
        const [ActualizarServiciosManza] = await connectionI.execute('UPDATE servicio SET Nom_Serv=?, Descripc=?, Categ_Serv=?, Tipo_Serv=? WHERE Cod_Serv=?', [Nom_Serv, Descripc, Categ_Serv, Tipo_Serv, Cod_Servicio]);
        await connectionI.end();
        console.log(ActualizarServiciosManza)
        res.status(201).send(`
            <script>
                window.location="../Vistas/html/adminn.html";
            </script>
        `);
    } catch (error) {
        // Maneja los errores y envía una respuesta de error al cliente
        console.error('Error en el servidor', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
controlador.post('/editar-manzanas/:Cod_Manzana', async (req, res) => {
    try {
        const Cod_Manzana = req.params.Cod_Manzana;
        const { Nombre_Manzana, Localidad, Direccion, Municipio } = req.body;
        const connection = await mysql2.createConnection(db2);
        const [consultaManzanas] = await connection.execute('SELECT * FROM manzanas WHERE Cod_Manzana = ?', [Cod_Manzana]);
        if (consultaManzanas.length > 0) {
            res.sendFile(path.join(__dirname, '../vistas/HTML/actualizarManza.html'));
        } else {
            res.status(404).json({ error: 'Servicio no encontrado' });
        }
        await connection.end();
    } catch (error) {
        console.error('Error en el servidor', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
controlador.post('/editar-manzana/:Cod_Manzana', async (req, res) => {
    try {
        const Cod_Manzana = req.params.Cod_Manzana;
        const { Nombre_Manzana, Localidad, Direccion, Municipio } = req.body;
        const connection = await mysql2.createConnection(db2);
        const [actualizarManzana] = await connection.execute('UPDATE manzanas SET Nombre_Manzana=?, Localidad=?, Direccion=?, Municipio=? WHERE Cod_Manzana=?', [Nombre_Manzana, Localidad, Direccion, Municipio, Cod_Manzana]);
        await connection.end();
        console.log(actualizarManzana);
        res.status(201).send(`
            <script>
                window.location="../Vistas/html/adminn.html";
            </script>
        `);
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
controlador.delete('/eliminar-servicio/:Cod_Servicio', async (req, res) => {
    const servicioID=req.params.Cod_Servicio;
    try {
        const connectionI=await mysql2.createConnection(db2)
  const [Eliminar_manserv]= await connectionI.execute('DELETE FROM manzanas_servicio WHERE id_Servicio2 = ?',[servicioID])
  const [eliminarservs]=await connectionI.execute('DELETE FROM servicio WHERE Cod_Serv = ?;',[servicioID])
  console.log(Eliminar_manserv,eliminarservs)
        await connectionI.end();
    }
    catch (error) {
        console.error('Error al eliminar sercicio: ', error)
        res.status(500).send("Error al eliminar sercicio")
    }
})
controlador.delete('/eliminar-Usuario/:Id_Mujer', async (req, res) => {
    const usuarioID=req.params.Id_Mujer;
    try {
        console.log(usuarioID)
        const connectionI=await mysql2.createConnection(db2)
 const [eliminarusuarios]=await connectionI.execute('DELETE FROM solicitudes WHERE fkMujeresSolicitudes = ?',[usuarioID])
  const [Eliminar_usu]= await connectionI.execute('DELETE FROM mujeres WHERE Id_Mujer =?',[usuarioID])

  console.log(Eliminar_usu,eliminarusuarios)
        await connectionI.end();
        res.status(201).send(`<script>
        window.location='../Vistas/HTML/adminn.html'
        </script>`)
    }
    catch (error) {
        console.error('Error al eliminar usuario: ', error)
        res.status(500).send("Error al eliminar usuario")
}
})
controlador.post('/crear-servicio', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../Vistas/HTML/CrearServicio.html'));
    } catch (error) {
        console.error('Error en el servidor', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
controlador.post('/crear-servicios', async (req, res) => {
    const { Nom_Serv, Descripc, Categ_Serv, Tipo_Serv } = req.body;
    try{
        const connectionI=await mysql2.createConnection(db2)
        await connectionI.execute('INSERT INTO servicio (Nom_Serv,Descripc, Categ_Serv, Tipo_Serv ) VALUES (?, ?, ?, ?)',
                [Nom_Serv, Descripc, Categ_Serv, Tipo_Serv]);
                res.sendFile(path.join(__dirname, '../Vistas/HTML/adminn.html'));
                await connectionI.end();
        }
    catch{
        console.error('Error en el servidor: ', error);
        res.status(500).sendFile(__dirname, '../Vistas/HTML/adminn.html');
    }
});
controlador.post('/crear-manzana', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../Vistas/HTML/CrearManzana.html'));
    } catch (error) {
        console.error('Error en el servidor', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
controlador.post('/crear-manzanas', async (req, res) => {
    const { Nombre_Manzana, Localidad, Direccion,Municipio } = req.body;
    try {
        const ConnectionI = await mysql2.createConnection(db2);
        await ConnectionI.execute('INSERT INTO manzanas (Nombre_Manzana, Localidad, Direccion,Municipio) VALUES (?, ?, ?,?)',
            [Nombre_Manzana, Localidad, Direccion,Municipio]);
        await ConnectionI.end();
        res.sendFile(path.join(__dirname, '../Vistas/HTML/adminn.html'));
    } catch (error) {
        console.error('Error en el servidor: ', error);
        res.status(500).send('Error en el servidor');
    }
});
controlador.get('/Vistas/HTML/CrearServicio.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../Vistas/HTML/CrearServicio.html'))
})
controlador.get('/Vistas/HTML/CrearManzana.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../Vistas/HTML/CrearManzana.html'))
})
controlador.get('/Vistas/html/actualizarServ.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../Vistas/HTML/actualizarServ.html'))
})
controlador.get('/vistas/html/actualizarManza.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../vistas/HTML/actualizarManza.html'))
})
controlador.get('/Vistas/html/adminn.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../Vistas/HTML/adminn.html'))
})
controlador.get('/Vistas/HTML/actualizar.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../Vistas/HTML/actualizar.html'))
})
controlador.get('/vistas/HTML/cerrarsesion.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../vistas/HTML/cerrarsesion.html'))
})
controlador.get('/vistas/HTML/IniciarSe.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../vistas/HTML/IniciarSe.html'))
})
controlador.get('/vistas/HTML/Registra.html',(req,res)=>{
    res.sendFile(path.join(__dirname,'../vistas/HTML/Registra.html'))
})
controlador.listen(3000,()=>{
    console.log('Servidor Nodemon escuchado')
});
