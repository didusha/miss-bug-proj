
import express from 'express' 

const app = express() 

app.get('/', (req, res) => res.send('Hello there Thank you')) 
app.listen(3030, () => console.log('Server ready at port 3030'))

