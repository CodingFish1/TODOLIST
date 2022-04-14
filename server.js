const http = require('http'); //步驟1 載入模組
const { title } = require('process');
const { isTypedArray } = require('util/types');
const { v4: uuidv4 } = require('uuid')
const errHandle = require('./errorHandle')

const todos = []


const requestListener = (req,res) => { //步驟3 req是請求資料 res是回復資料
    console.log('Request URL:', req.url)
    console.log('Method:', req.method)
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
       'Content-Type': 'application/json'
     }

     let body = ''
     req.on('data', chunk => { body+=chunk }) //接收檔案

    if (req.url == '/todos' && req.method == "GET") {
        res.writeHead(200,headers) //表頭資訊
        res.write(JSON.stringify({ //内容
            "status": "success",
            "data": todos,
        }))
        res.end() //發送完畢

    } else if (req.url == '/todos' && req.method == "POST") {
        req.on('end',() => {//'data'接收完后，才會觸發這裏
            try {
                const title = JSON.parse(body).title
                if (title != undefined) {
                    const todo = {
                        "title": title,
                        "id": uuidv4()
                    }
                    todos.push(todo)
                    res.writeHead(200,headers)
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": '新增一筆資料',
                    }))
                    res.end()
                } else {
                    errHandle(res)
                }
            } catch (error) {
                errHandle(res)
            }})

    } else if (req.url =="/todos" && req.method == "DELETE") { //刪除全部
        todos.length = 0 //清空整個陣列的内容
        res.writeHead(200,headers)
        res.write(JSON.stringify({
            "status": "success",
            "message": 'all deleted'
        }))
        res.end ()
    } else if (req.url.startsWith("/todos/") && req.method == "DELETE") { //刪除單筆
        const id = req.url.split('/').pop() //拆分字串並抓取最後一筆資料（通常是UUID）
        const index = todos.findIndex (element => element.id === id)
        if (index !== -1) {
            todos.splice(index,1) //根據索引刪除陣列中的單筆資料
            res.writeHead(200,headers)
            res.write(JSON.stringify({
                "status": "success",
                "message": 'single deleted',
            }))
            res.end ()
        } else {
            res.writeHead(400,headers)
            res.write(JSON.stringify({
                "status": "false",
                "message": 'No such item',
                "id": 1
            }))
            res.end ()
        }
    } 
    else if (req.url.startsWith("/todos/") && req.method == "PATCH") {
        req.on('end', () => {
            try{
                const todo = JSON. parse(body).title
                const id = req.url.split('/').pop()
                const index = todos.findIndex(element => element.id ===id )
                if (todos !== undefined && index !== -1) {
                    todos[index].title = todo
                    res.writeHead(200,headers)
                    res.write(JSON.stringify({
                        "status": "success",
                        "message": '單筆資料修改成功',
                    }))
                    res.end ()
                } else {
                    errHandle(res)
                }
                res.end()
            } catch {
                errHandle(res)
            }
        })
    }

      else if (req.method == "OPTIONS") { //处理Prefly
        res.writeHead(200,headers)
        res.end () 
    }

      else {
        res.writeHead(404,headers)
        res.write(JSON.stringify({
            "status": "false",
            "message": 'Wrong place'
        }))
        res.end()
    }

}

const server = http.createServer(requestListener) //步驟2 設定Listener
server.listen(process.env.PORT || 3005);

console.log('Running')

// console.log(JSON.parse(body)) //傳回來的資料要用JSON.parse轉成物件