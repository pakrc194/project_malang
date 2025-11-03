let base_date_format = (date) => {
    let inputDate = new Date(date)
    
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0')
    const day = String(inputDate.getDate()).padStart(2, '0')
    return  `${year}-${month}-${day}`
}

module.exports = { base_date_format }