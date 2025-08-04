
import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
//* Express Config:
app.use(express.static('public'))
app.use(cookieParser())

//* Express Routing:

//* Read
app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot get bugs')
        })
})

//* Create/Edit (before get by id)
app.get('/api/bug/save', (req, res) => {
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: req.query.createdAt
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

//* Get By Id
app.get('/api/bug/:bugId', (req, res) => {
    //get id from server
    const { bugId } = req.params

    let visitedBugs = req.cookies.visitedBugs || []
    loggerService.debug("User visited at the following bugs:", visitedBugs)

    if (!visitedBugs.includes(bugId) && visitedBugs.length >= 3) return res.status(401).send('Wait for a bit')
    visitedBugs.push(bugId)

    res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 7 })

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(500).send('Cannot get bug')
        })
})

//* Remove/Delete
app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send('bug Removed'))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug')
        })
})



// app.get('/cookies', (req, res) => {
//     let visitedBugs = req.cookies.visitedBugs || []
// visitedBugs[0]++
// res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 7 })

//     res.send(visitedBugs)
// })


// app.get('/', (req, res) => res.send('Hello there Thank you'))
app.listen(3030, () => console.log('Server ready at port 3030'))

