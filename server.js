const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')


app.use('/public', express.static('public'));

let db;
MongoClient.connect("mongodb+srv://admin:1q2w3e4r@cluster0.iklsc33.mongodb.net/?retryWrites=true&w=majority", { useUnifiedTopology: true }, (error, client) => {
    if (error) { return console.log(error) };
    db = client.db('apple_node');
    // 언더바 id하면 내가 id를 부여할 수 있음 그러면 for문으로 id 하나씩 늘리면 될 거같음
    // db.collection('post').insertOne({ 이름: 'jont', _id: 100 },(error, result)=> {
    //     if (error) {return console.log(error);}

    // });





    app.listen(8080, () => {
        console.log("실행이 되었습니다");
    });
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/write', function (req, res) {
    res.sendFile(__dirname + '/write.html');
});

// ejs 파일
app.get('/list', (req, res) => {
    // 모든 데이터 찾아오기 
    db.collection('post').find().toArray((error, result) => {
        console.log(result)
        res.render('list.ejs', { posts: result });
        
    })


});

// 수정기능
app.get('/edit/:id', (req, res) => {
    db.collection('post').findOne({ _id: parseInt(req.params.id) }, (err, result) => {
        console.log(result)
        res.render('edit.ejs', { post: result })
    })

})

app.put('/edit',(req,res)=>{
    db.collection('post').updateOne()
})

// 상세 페이지
app.get('/detail/:id', async (req, res) => {
    try {
        const result = await db.collection('post').findOne({ _id: parseInt(req.params.id) });
        if (!result) {
            res.status(404).send('게시물을 찾을 수 없습니다.');
            return;
        }
        console.log(result);
        res.render('detail.ejs', { data: result });
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});



// form action data
//누군가 폼에서 add로 post 요청하면
app.post('/add', (req, res) => {
    console.log(req.body.date);
    console.log(req.body.title);
    res.send('전송완료');
    // db.couter 내의 총 게시물 갯수를 찾음
    db.collection("counter").findOne({ name: '게시물갯수' }, (error, result) => {
        //                              총게시물갯수를 변수에 저장

        let 총게시물갯수 = result.totalPost

        // form 안에 있는 input 데이터를 이런 식으로 쓰면 됨 auto increment = db에 자동으로 1을 증가시킴
        db.collection('post').insertOne({ _id: 총게시물갯수, 제목: req.body.title, 날짜: req.body.date }, (error, result) => {
            //                                     이제 db.post에 새게시물을 기록
            console.log("저장완료")
            // 데이터를 수정할때 operator를 써야함 $ - 바꿀값 / $inc - 기존값에 더해줄 값
            db.collection("counter").updateOne({ name: "게시물갯수" }, { $inc: { totalPost: 1 } }, (error, result) => {
                if (error) { return console.log(error) } // 완료되면 db.counter 내의 총게시물갯수 +!
            })

        });

    })

});

app.delete('/delete', (req, res) => {
    console.log(req.body)
    req.body._id = parseInt(req.body._id) // JS함수중에 parseInt 특정 값을 정수로 변환시켜줌 
    // 포스트라는 db 컬레션 안에 게시물번호(_id)에 따라 삭제
    db.collection('post').deleteOne(req.body, (err, result) => {
        console.log("삭제완료")
        res.status(200).send({ massage: '삭제를 완료했습니다.' });
    })

})

