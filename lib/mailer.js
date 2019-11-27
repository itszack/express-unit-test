exports.sendWelcomeEmail = function (email, name) {
    // console.log("--sendWelcomeEmail--");
    if (!email || !name) {
        return Promise.reject(new Error("Invalid input"));
    }

    var body = `Dear ${name}, welcome to our family!`;

    return sendEmail(email, body);
};

exports.sendPasswordResetEmail = function (email) {
    // console.log("--sendPasswordResetEmail--");
    if (!email) {
        return Promise.reject(new Error("Invalid input"));
    }

    var body = "Please click http://some_link to reset your password.";

    return sendEmail(email, body);
};

function sendEmail(email, body) {
    // console.log("--sendEmail--");
    if (!email || !body) {
        return Promise.reject(new Error("Invalid input"));
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Email Sent!");
            // return reject(new Error("Fake Error"));
            return resolve("Email sent");
        }, 100);
    });
};
