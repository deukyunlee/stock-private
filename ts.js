const tf = require("@tensorflow/tfjs");
const mysql = require("mysql");
// 1. 과거의 데이터를 준비합니다.
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "111111",
  database: "capstone",
  port: "3306",
  multipleStatements: true,
  // dateStrings: "date",
  //socketPath: socket_path,
});
var open = new Array();
var close = new Array();
const sql = `select close from daily where symbol = "tsla" limit 500 offset 500`;
db.query(sql, async (err, result) => {
  Object.keys(result).forEach(async function (key) {
    open.push(result[key].close);
  });
  console.log(open);
  const sql2 = `select close from daily where symbol = "tsla" limit 500 offset 1000`;
  db.query(sql2, async (err, result) => {
    Object.keys(result).forEach(async function (key) {
      close.push(result[key].close);
    });
    var input = tf.tensor(open);
    var output = tf.tensor(close);

    // // 2. 모델의 모양을 만듭니다.
    var X = tf.input({ shape: [1] });
    var Y = tf.layers.dense({ units: 1 }).apply(X);
    var model = tf.model({ inputs: X, outputs: Y });
    var compileParam = {
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
    };
    model.compile(compileParam);

    // 3. 데이터로 모델을 학습시킵니다.
    // var fitParam = { epochs: 1000000 };
    var fitParam = {
      epochs: 500,
      callbacks: {
        onEpochEnd: function (epoch, logs) {
          console.log("epoch", epoch, logs);
        },
      },
    }; // loss 추가 예제
    model.fit(input, output, fitParam).then(function (result) {
      // 4. 모델을 이용합니다.
      // 4.1 기존의 데이터를 이용
      var 예측한결과 = model.predict(input);
      var 다음주온도 = [
        1136.99, 1081.92, 1116, 1109.03, 1156.87, 1137.06, 1096.38, 1089.01,
        1054.73, 1013.39, 1033.42, 1063.51, 1067.95, 1023.5, 1162.94, 1222.09,
        1229.91, 1213.86, 1172, 1208.59, 1114, 1077.04, 1037.86, 1018.43,
        1024.86, 909.68, 894, 865.8, 864.27, 870.11,
      ];
      var 다음주원인 = tf.tensor(다음주온도);
      var 다음주결과 = model.predict(다음주원인);
      // 다음주결과.print();
      var test = new Array();
      test = 다음주결과;
      console.log(test.values);
      //   예측한결과.print();
    });
  });
});
// console.log(open);
// var open = [
//   860, 904.55, 932, 922, 907.34, 923.32, 891.14, 905.66, 931.25, 936.72, 846.35,
//   829.1, 937.41, 918.4, 930, 943.9, 996.27, 995.65, 1030.51, 1049.61, 1031.56,
//   1106.22, 1064.4, 1058.12, 1026.96, 1064.7, 1088.12, 1149.59, 1199.78, 1056.78,
//   1070.34, 1086.19, 1088.47, 1093.94, 1067, 1008.87, 938.53, 899.94, 932.57,
//   926.92, 975.99, 958.51, 966.41, 1017.03, 1003.8, 1068.96, 1051.75, 1009.01,
//   1014.97, 1084.6, 1095, 1144.76, 1136.99, 1081.92, 1116, 1109.03, 1156.87,
//   1137.06, 1096.38, 1089.01, 1054.73, 1013.39, 1033.42, 1063.51, 1067.95,
//   1023.5, 1162.94, 1222.09, 1229.91, 1213.86, 1172, 1208.59, 1114, 1077.04,
//   1037.86, 1018.43, 1024.86, 909.68, 894, 865.8, 864.27, 870.11, 843.03, 818.32,
//   811.08, 805.72, 791.94, 785.49, 793.61, 782.75, 780.59, 781.53, 775.22,
//   775.48, 781.31, 777.56, 791.36, 774.39, 753.64, 751.94, 739.38, 730.17,
//   759.49, 756.99, 755.83, 744.49, 743, 736.27, 754.86, 753.87, 752.92, 733.57,
//   732.39, 734.09, 735.72, 730.91, 711.92, 701.16, 711.2, 708.49, 706.3, 680.26,
//   673.47, 688.99, 665.71, 686.17, 717.17, 722.25, 707.82, 709.99, 713.76, 699.1,
//   714.63, 710.92, 709.74, 709.67, 687.2, 677.35, 646.98, 644.78, 657.62, 643.38,
//   649.26, 655.29, 660.5,
// ];
// var close = [
//   668.54, 685.7, 656.95, 652.81, 644.65, 659.58, 678.9, 677.92, 679.7, 680.76,
// ];
// var 원인 = tf.tensor(open);
// var 결과 = tf.tensor(close);

// // 2. 모델의 모양을 만듭니다.
// var X = tf.input({ shape: [1] });
// var Y = tf.layers.dense({ units: 1 }).apply(X);
// var model = tf.model({ inputs: X, outputs: Y });
// var compileParam = {
//   optimizer: tf.train.adam(),
//   loss: tf.losses.meanSquaredError,
// };
// model.compile(compileParam);

// // 3. 데이터로 모델을 학습시킵니다.
// // var fitParam = { epochs: 1000000 };
// var fitParam = {
//   epochs: 10000,
//   callbacks: {
//     onEpochEnd: function (epoch, logs) {
//       console.log("epoch", epoch, logs);
//     },
//   },
// }; // loss 추가 예제
// model.fit(input, output, fitParam).then(function (result) {
//   // 4. 모델을 이용합니다.
//   // 4.1 기존의 데이터를 이용
//   var 예측한결과 = model.predict(원인);
//   var 다음주온도 = [688.72];
//   var 다음주원인 = tf.tensor(다음주온도);
//   var 다음주결과 = model.predict(다음주원인);
//   다음주결과.print();
//   //   예측한결과.print();
// });

// // 예측률, 예상가, 매수 or 매도 추천 여부
// // 상위 10개 종목만?
