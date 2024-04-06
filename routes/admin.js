const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Categoria.js")
const Categoria = mongoose.model("categorias")
require("../models/Posts.js")
const Postagem = mongoose.model("postagens")
const {eAdmin}= require("../helpers/eAdmin.js")


router.get('/', eAdmin, (req, res)=>{
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res)=>{
    res.send("Página de posts")
})

router.get('/categorias', eAdmin, (req, res)=>{
    Categoria.find({}).lean().sort({data: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Ouve um erro ao listar as categorias")
        res.redirect("/admin")
    })
}) 

router.get('/categorias/add', eAdmin, (req, res)=>{
    res.render("admin/addcategoria")
})

router.post("/categorias/nova", eAdmin, (req, res)=>{

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addcategoria", {erros: erros})
    } else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao criar categoria!")
            res.redirect("/admin")
        })
    }

    
})

router.get("/categorias/edit/:id", eAdmin, (req,res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categorias) => {
        res.render("../views/admin/editcategorias", {categorias: categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
    
})

router.post("/categorias/edit", eAdmin, (req, res)=>{
    Categoria.findOne({_id: req.body.id}).then((categorias)=>{
        categorias.nome = req.body.nome
        categorias.slug = req.body.slug

        categorias.save().then(()=>{
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg", "Ouve um erro ao editar a categoria")
        })

    }).catch((err)=>{
        req.flash("error_msg", "Erro ao editar categoria!")
        res.redirect("/admin/categorias")
    })
}
)

router.post("/categorias/deletar", eAdmin, (req, res)=>{
    Categoria.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg", "Error ao deletar categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", eAdmin, (req, res)=>{
    Postagem.find({}).lean().populate("categoria").sort({date: "desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg", "Houve um error ao listar as postagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", eAdmin, (req, res)=>{
    Categoria.find({}).lean().then((categorias)=>{
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err)=>{
        console.error("Erro ao buscar categorias:", err);
        req.flash("error_msg", "Houve um erro ao criar")
        res.redirect("/admin")
    })
    

})

router.post("/postagens/nova", eAdmin, (req, res)=>{

    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida!"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            console.log(err)
            req.flash("error_msg", "Ouve um erro ao criar postagem!")
            res.redirect("/admin/postagens")
        })
    }

})


router.get("/postagens/edit/:id", eAdmin, (req, res)=>{

    Postagem.findOne({_id: req.params.id}).lean().then((postagens)=>{

        Categoria.find({}).lean().then((categorias)=>{
            res.render("admin/editpostagens", {categorias: categorias,  postagens: postagens})
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição!")
        res.redirect("/admin/editpostagens")
    })

    
})

router.post("/postagens/edit", eAdmin, (req, res)=>{

    Postagem.findOne({_id: req.body.id}).then((postagens)=>{
        postagens.titulo = req.body.titulo,
        postagens.slug = req.body.slug,
        postagens.descricao = req.body.descricao,
        postagens.conteudo = req.body.conteudo,
        postagens.categoria = req.body.categoria

        postagens.save().then(()=>{
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao editar postagem!")
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao salvar a edição!")
        res.redirect("/admin/postagens")
    })


})

router.get("/postagens/deletar/:id", eAdmin, (req, res)=>{
    Postagem.deleteOne({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao deletar postagem")
        res.redirect("/admin/postagens")
    })
})

module.exports = router