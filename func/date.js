let base_date_format = (date) => {
    let inputDate = new Date(date)
    
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0')
    const day = String(inputDate.getDate()).padStart(2, '0')
    return  `${year}-${month}-${day}`
}

let base_time_format = (time) => {
    const inputTime = new Date(`1970-01-01T${time}`);
    const hour = String(inputTime.getHours()).padStart(2, '0');
    return `${hour}시`;
};

module.exports = { base_date_format, base_time_format };

