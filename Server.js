var mysql = require('mysql');
const utf8 = require('utf8');



let conn ='';
mysql = require('mysql');
function handleDisconnection() {
    conn = mysql.createConnection({
        host: 'us-cdbr-east-05.cleardb.net',
        user: 'b146a8e227b7f9',
        password: 'b37fd948',
        database: 'heroku_4bdaee5640d5235',
        port: 3306,
    })
    conn.connect(function (err) {
        if (err) {
            setTimeout('handleDisconnection()', 2000);
        }
    });

    conn.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('db error执行重连:' + err.message);
            handleDisconnection();
        } else {
            throw err;
        }
    });
}

handleDisconnection();

var http = require('http');
var server = http.createServer(function(req, res){
    if(req.url=='/'){
        res.writeHead(200,{'Content-Type':'text/html'});
        res.write('<html><body>This is Home Page.</body></html>');
        res.end();
    }else if (req.url == '/mysql_lookup'){
        console.log('lookup');
        var body = '';
        req.on('data', function(data){
            body += data;
            console.log('partial body' + body);
        });
        req.on('end', function(){
            console.log('Body'+body);
            var obj = JSON.parse(body.toString());
            console.log(obj['table']);
            var sqlstring = '';
            sqlstring += 'SELECT ';
            console.log(obj['fields'][0]);
            console.log(obj['fields'].length);
            for(i in obj['fields']){
                sqlstring += obj['fields'][i] + ' ';
            }
            sqlstring += 'FROM '+ obj['table'] + ' ';
            if('where' in obj){
                sqlstring += 'WHERE ';
                var count = 1;
                for(const [key, value] of Object.entries(obj['where'])){
                    if(count != 1){
                        sqlstring += ' AND ';
                    }
                    sqlstring += key.toString() + ' = ' + mysql.escape(value.toString());
                    count++;
                }
            }
            console.log(sqlstring);
            conn.query(sqlstring, function(err, result){
                if(err){
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(result));
                res.end();
            });
        });
    }else if(req.url == '/mysql_insert'){
        console.log('insert');
        var body = '';
        req.on('data', function(data){
            body += data;
            console.log('partial body' + body);
        });
        req.on('end', function(){
            console.log('Body '+body);
            var obj = JSON.parse(body.toString());
            var sqlstring = '';
            sqlstring += 'INSERT INTO ' + obj['table'] + ' ';
            var strkey = '(';
            var strvalue = '(';
            var count = 0;
            for(const [key, value] of Object.entries(obj['insert'])){
                if(count != 0){
                    strkey += ', ';
                    strvalue += ', ';
                }
                strkey += key;
                strvalue += mysql.escape(value);
            }
            strkey += ')';
            strvalue += ')';
            sqlstring += strkey + ' Values ' + strvalue;
            console.log(sqlstring);
            conn.query(sqlstring, function(err, result){
                if(err) throw err;
                console.log('1 record inserted');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({"OK": "OK"}));
                res.end();
            });
        });
    }else if(req.url == '/mysql_delete'){
        console.log('delete');
        var body = '';
        req.on('data', function(data){
            body += data;
            console.log('partial body' + body);
        });
        req.on('end', function(){
            console.log('Body '+body);
            var obj = JSON.parse(body.toString());
            var sqlstring = '';
            sqlstring += 'DELETE FROM ' + obj['table'] + ' WHERE ';
            var count = 0;
            for(const [key, value] of Object.entries(obj['delete'])){
                if(count != 0){
                    sqlstring += ' AND ';
                }
                count++;
                sqlstring += key + ' = ' + mysql.escape(value);
            }
            console.log(sqlstring);
            conn.query(sqlstring, function(err, result){
                if(err) throw err;
                console.log('1 record delete');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({"OK": "OK"}));
                res.end();
            });

        });

    }else if(req.url == '/mysql_update'){
        console.log('update\n\n\n\n\n');
        var body = '';
        req.on('data', function(data){
            body += data;
            console.log('partial body' + body);
        });
        req.on('end', function(){
            console.log('Body '+body);
            var obj = JSON.parse(body.toString());
            for(const [key, value] of Object.entries(obj['update'])){
                var sqlstring = '';
                sqlstring += 'UPDATE ' + obj['table'] + ' SET ' + key + ' = ' + mysql.escape(value) + ' WHERE ';
                var count = 0;
                for(const [key2, value2] of Object.entries(obj['where'])){
                    if(count != 0){
                        sqlstring += ' AND ';
                    }
                    sqlstring += key2 + ' = ' + mysql.escape(value2);
                }
                conn.query(sqlstring, function(err, result){
                    if(err) throw err;
                    console.log('1 thing update');
                });
            }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({"OK": "OK"}));
        res.end();
    }else{
        res.end('Invalid Request!');
    }

});

const PORT = process.env.PORT || 5000;

server.listen(PORT);