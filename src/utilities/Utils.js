import moment from "jalali-moment";

export const changeTimeZone = (time, showTime = true) => {
    try{
        const resultTime = moment(time).locale("fa").format("HH:mm:ss");
        const resultDate = moment(time).locale("fa").format("YYYY/MM/DD");
        const resultDay = moment(time).locale("en").format("ddd")
        return `${resultDate} ${resultDay} ${showTime ? resultTime : ""}`
    }catch(error){
        return 'N/A';
    }
    
}

export const windowAddActivityEventListeners = (w, cb) => {
    w.document.addEventListener('mousemove', cb, true);
    w.document.addEventListener('mousedown', cb, true);
    w.document.addEventListener('mouseup', cb, true);
    w.document.addEventListener('keydown', cb);
    w.document.addEventListener('keyup', cb);
}


export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes*1024) / Math.log(k));

    return parseFloat((bytes*1024 / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}