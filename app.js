const express = require('express');
const app = express();
const { Pool } = require('pg');
const redis = require('redis');
require('dotenv').config();
const itemsPool = new Pool({
    connectionString: process.env.POSTGRES_URL, // Move PostgreSQL connection string to an environment variable
    ssl: {
        rejectUnauthorized: false
    }
});
const client = redis.createClient();

client.on('error',(err)=>{
    console.log('Redis client error', err);
})
client.connect();
app.get('/', async (req, res)=>{
    try { 
        let redisData = await client.get('newValue');
        if(redisData){            
            return res.json(JSON.parse(redisData))
        }
        let result = await itemsPool.query(`select * from users`);
        
        await client.set('newValue',JSON.stringify(result.rows))
        return res.json(result.rows)
    } catch (error) {
        console.log(error)
        return res.json({
            err: error
        })
    }
})

app.get('/remove-cache', async (req, res)=>{
    try { 
        let redisData = await client.get('newValue');
        if(redisData){            
            await client.del('newValue');
        }
        return res.json({
            status:"success"
        })
    } catch (error) {
        console.log(error)
        return res.json({
            err: error
        })
    }
})
app.listen(3000,()=>{
    console.log('App is running')
})