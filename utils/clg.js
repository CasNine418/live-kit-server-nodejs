// const moment = require('moment');  
import moment from "moment";
  
const clg = (prf, sta, method) => {  
    let dateTime = moment();  
    let formattedDateTime = `[${dateTime.format('YYYY-MM-DD HH:mm:ss')}]`;
  
    console.log(`${formattedDateTime}[${method}/${sta}]:${prf}`);  
}  
  
export default clg;