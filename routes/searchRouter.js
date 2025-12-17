const express = require('express')
const util = require('util')
const router = express.Router()
const conn = require('../db/db')
const {multer} = require('../func/multer')

router.get('/', async (req, res)=>{
    console.log('search word : ', req.query.word)
    let word = `${req.query.word}%`
    let searchPerfSQL = 'select * from performance_info where perf_name like ? and is_hidden = 0'
    let searchActorSQL = 'select * from actor_info where actor_name like ?'
    
    let tasks = []

    tasks.push(conn.query(searchPerfSQL, [word]))
    tasks.push(conn.query(searchActorSQL, [word]))

    const [searchPerfQuery, searchActorQuery] = await Promise.all(tasks)
    console.log('perf', searchPerfQuery)
    console.log('actor', searchActorQuery)

    res.render('../views/search.html', {perfResult: searchPerfQuery, actorResult:searchActorQuery})
})


module.exports = router