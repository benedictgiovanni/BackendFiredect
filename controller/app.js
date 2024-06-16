//Impor library yang diperlukan
const router = require('express').Router()
const mongo = require('mongoose')
const db = mongo.connection
//Membuat variabel q sesuai dengan queue di MongoDB
var q = 'Firedect';
koneksiRmq()

//Deklarasi fungsi koneksiRMQ
function koneksiRmq() {
    //Masukkan protokol RMQ hostname, port, username, password, dan virtual host sesuai dengan yang anda gunakan    
    require('amqplib/callback_api').connect({ protocol: 'amqp', hostname: '103.167.112.188',
     port: '5672', username: 'fik', password: 'fik123', vhost: '/fik' }, function (err, conn){ 
        try {
            if (err) {
                console.log('Tidak ada koneksi jaringan')
                reconnect();
            }else{
                console.log('Terhubung ke RMQ')
                consumer(conn);
            }
        } catch (e) {
            console.log('Terjadi kesalahan server di RabbitMQ')
        }
    });
}

//Jika koneksi ke RabbitMQ berhasil, maka fungsi consumer akan dipanggil
function consumer(conn) {
    try {
        var sukses = conn.createChannel(on_open);
        function on_open(err, ch) {
            ch.consume(q, function(msg){
                if (msg == null) {
                    console.log("Pesan Tidak ada")
            } else {
                console.log(msg.content.toString());
                ch.ack(msg);
                var json = msg.content.toString();
                const obj = JSON.parse(json);
                //Membuat variabel Temp, Hum, Kondisi sesuai dengan yang anda nuat di arduino
                var Temp=(obj.Temp);
                var Hum=(obj.Hum);
                var kondisi=(obj.kondisi);
                //Deklarasi variabel history
                const History = {Temp:Temp, Hum:Hum, kondisi:kondisi}
                try {   
                    Save(History) //Menyimpan data ke variabel history
                } catch (e) {
                    console.log("Error")
                }
            }
        });
    }
 } catch (e) {
    console.log("Error")       
    }
}    

//Membuat fungsi save
function Save(history){
    koneksi()
    try {
        db.collection("sensors").insertOne(history,function(err){
        if(err){
            console.log('Gagal')
        } else{
            console.log('Berhasil menyimpan data ke database')
        }
    });
    } catch (e) {
       console.log("error") 
    }
}

//Membuat fungsi koneksikeDB
function koneksi() {
    mongo.connect('mongodb://127.0.0.1:27017/Firedect',{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    try {
        db.once('open', ()=> console.log('Berhasil terhubung ke database'))
    } catch (e) {
        db.on('error', error=> console.log(error))
        console.log(console.error)
    }
}
//Membuat fungsi reconnect
function reconnect() {
 console.log("menghubungkan ulang")
 koneksiRmq(setInterval, 1000);   
}

module.exports = { router, koneksi }