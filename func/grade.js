let nowGrade = (score) => {
    let grade = 1
    if(score >= 5000000 ) {
        grade = 5
    } else if (score >= 1000000) {
        grade = 4
    } else if (score >= 300000) {
        grade = 3
    } else if (score >= 100000) {
        grade = 2
    } else {
        grade = 1
    } 
    return grade
}

module.exports = {nowGrade}
