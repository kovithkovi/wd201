// const fs = require("fs");

// // const hello = () => {
// //   console.log("Hello GitHub!");
// // };

// fs.writeFile(
//   "sample.txt",
//   "This sample.txt\n welcome to the node.js file system",
//   (err) => {
//     if (err) throw err;
//     console.log("File Created!");
//   }
// );

// fs.readFile("sample.txt", (err, data) => {
//   if (err) throw err;
//   console.log(data.toString());
// });

// fs.unlink("sample.txt", (err) => {
//   if (err) throw err;
//   console.log("File test.txt deleted successfully!");
// });

// const fs = require("fs");
// const http = require("http");

// const server = http.createServer((req, res) => {
//   const stream = fs.createReadStream("sample.txt");
//   stream.pipe(res);
// });
// server.listen(2000);

// const readline = require("readline");

// const lineDetail = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// lineDetail.question(`Please enter you name --> `, (name) => {
//   console.log(`Name: ${name}`);
//   lineDetail.close();
// });

const arg = require("minimist")(process.argv.slice(2));
console.log(arg);
console.log(arg._[0]);
