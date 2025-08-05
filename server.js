
import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
//* Express Config:
app.use(express.static('public'))
//* Teach express how to use cookies
app.use(cookieParser())
app.use(express.json())
//* Teach express how to read qurey params
app.set('query parser', 'extended')

//* Express Routing:

//* Read
app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        labels: req.query.labels,
        sortField: req.query.sortField,
        sortDir: req.query.sortDir
    }
    bugService.query(filterBy)
        .then(bugs => {
            bugService.printBugs(bugs)
            res.send(bugs)
        }
        )
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot get bugs')
        })
})

//* Create
app.post('/api/bug', (req, res) => {
    const bugToSave = {
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

//*Edit
app.put('/api/bug/:bugId', (req, res) => {
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: +req.query.createdAt || '',
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

//* GetById - Read
app.get('/api/bug/:bugId', (req, res) => {
    //get id from server
    const { bugId } = req.params

    let visitedBugs = req.cookies.visitedBugs || []
    loggerService.debug("User visited at the following bugs:", visitedBugs)

    if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)
    if (visitedBugs.length > 3) return res.status(401).send('Wait for a bit')

    res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 7 })

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(500).send('Cannot get bug')
        })
})

//* Remove/Delete
app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send('bug Removed'))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug')
        })
})

// app.get('/', (req, res) => res.send('Hello there Thank you'))
app.listen(3030, () => console.log('Server ready at port 3030'))

