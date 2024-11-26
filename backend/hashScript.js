var CryptoJS = require("crypto-js");
var newPassword = "Hyla@12345";
var hashedNewPassword = CryptoJS.SHA256(newPassword).toString();
console.log(hashedNewPassword);
