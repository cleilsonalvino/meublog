//Carregando módulos
    const express = require('express')
    const { engine } = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express();
    const admin = require('./routes/admin.js')
    const path = require('path')
    const { fileURLToPath } = require('url')
    const { dirname } = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    const handlebars = require('handlebars')
    require("./models/Posts.js")
    const Postagem = mongoose.model("postagens");
    require("./models/Categoria.js")
    const Categoria = mongoose.model("categorias");
    const Usuario = require("./routes/usuario.js")
    const passport = require('passport')
    require("./config/auth.js")(passport)




    
    
//Configurações
    //Sessao
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())
    //Middleware
        app.use((req, res, next)=>{
            res.locals.success_msg = req.flash("success_msg") //variavel global
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })
    //Handlebars
        app.engine('handlebars', engine());
        app.set('view engine', 'handlebars');
        app.set('views', './views');
        const hbs = handlebars.create({
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true,
            },
        });
        
    //bodyParser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb+srv://cleilsonalvino:Cleil-db20@blogapp.gl3vo0c.mongodb.net/").then(()=>{
            console.log("Conectado ao MongoDB!")
        }).catch((err)=>{
            console.log(`Falha ao se conectar ao mongodb: ${err}`)
        })
    //
    //Public
        app.use(express.static(path.join(__dirname, "public")))
        app.use((req, res, next)=>{
            console.log("Oi eu sou um middware")
            next()
        })
// Rotas
        app.get("/", (req, res)=>{
            Postagem.find({}).maxTimeMS(10000).lean().populate("categoria").sort({data: "desc"}).then((postagens)=>{
                res.render("index", {postagens: postagens})
            }).catch((err)=>{
                console.log(err)
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/404")
            })
            
        })

        app.get("/postagens/:slug", (req, res)=>{
            Postagem.findOne({slug: req.params.slug}).lean().then((postagens)=>{
                if(postagens){
                    res.render("postagens/index", {postagens: postagens})
                }else{
                    req.flash("error_msg", "Esta postagem não existe")
                    res.redirect("/")
                }
                
            }).catch((err)=>{
                req.flash("error_msg", "Houve um error interno")
                res.redirect("/")
            })
        })

        app.get("/404", (req, res)=>{
            res.send("erro 40!")
        })

        app.get("/categorias", (req, res)=>{
            Categoria.find({}).lean().then((categorias)=>{
                res.render("categorias/index", {categorias: categorias})
            }).catch((err)=>{
                req.flash("error_msg", "Houve um error interno ao listar as categorias")
                res.redirect("/")
            })
        })

        app.get("/categorias/:slug", (req, res)=>{
            Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
                if(categoria){
                    Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                        res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                    }).catch((err)=>{
                        req.flash("error_msg", "Houve um erro ao listar os posts")
                        res.redirect("/")
                    })
                }else{
                    req.flash("error_msg", "Esta categoria não existe")
                    res.redirect("/")
                }
            }).catch((err)=>{
                req.flash("error_msg", "Houve um erro interno ao listar a página desta categoria")
                res.redirect("/")
        })
        })

        app.use("/admin", admin)
        app.use("/usuarios", Usuario)
// Outros
        const port = process.env.PORT || 8000;
        app.listen(port, () => {
          console.log(`Servidor rodando na port ${port}`);
        });


        
