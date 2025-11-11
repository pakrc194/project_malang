const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')
const {sPrefActWaid} = require('../db/admin_select_db')
const { base_date_format } = require('../func/date')


router.get('/:id', async (req, res) => {
    console.log('email', req.session?.email, req.params.id)
    const email = req.session?.email || req.session?.kakao_email;
    const loginout = req.session.email || req.session.kakao_email
    const name = req.session.user_name

    let userId = 7
    let isInterest = false
    if(email) {
        let sInterestSql = 'select * from user_interest_actor where actor_id = ? and user_id = ?'
        let selectQuery = await conn.query(sInterestSql, [req.params.id, userId])
        console.log(selectQuery)
        if(selectQuery.length > 0) {
            isInterest = true
        }
    }
    console.log(isInterest)

    let actorInfoSQL = 'select * from actor_info where actor_id = ?'
    conn.query(actorInfoSQL, [req.params.id], (actorInfoErr, actorInfoQuery)=> {
        console.log(actorInfoQuery)
        
        conn.query(sPrefActWaid, [req.params.id], (perfListErr, perfListQuery)=> {
            console.log(perfListQuery)
            res.render("../views/actorInfo.html",{actorInfo:actorInfoQuery[0], userEmail:email, isInterest, perfList:perfListQuery, loginout, name})
        })
    })
})

router.post('/interest/toggle', (req, res) => {
    let userId = 7
    console.log(req.body.actorId)
    let sInterestSql = 'select * from user_interest_actor where actor_id = ? and user_id = ?'
    let iInterestSql = `insert into user_interest_actor (actor_id, user_id) values (?, ?)`
    let dInterestSql = `delete from user_interest_actor where actor_id = ? and user_id = ?`
    conn.query(sInterestSql, [req.body.actorId, userId], (selectErr, selectQuery)=> {
        if(selectErr) {
            console.log(selectErr.message)
        } else {
            console.log(selectQuery.length)
            if(selectQuery.length==0) {
                conn.query(iInterestSql, [req.body.actorId, userId], (insertErr, insertQuery)=> {
                    if(insertErr) {
                        console.log(insertErr.message)
                        res.json({msg : 'error'})
                    } else {
                        console.log(insertQuery)
                        res.json({msg : 'insert'})
                    }
                })
            } else {
                conn.query(dInterestSql, [req.body.actorId, 7], (deleteErr, deleteQuery)=> {
                    if(deleteErr) {
                        console.log(deleteErr.message)
                        res.json({msg : 'error'})
                    } else {
                        console.log(deleteQuery)
                        res.json({msg : 'delete'})
                    }
                })
            }
            
        }
    })
})

module.exports = router