import 'date-fns';
import React from 'react';
import {Box, Grid} from "@material-ui/core";
import JalaliDatePicker from "../../../../utilities/JalaliDatePicker";

const TimeContraints = ({ dateLimits, setDateLimits, handleTime, handleErrorDate }) => {
             
    const setDateLimitError = (errorFrom, errorTo) => {
        setDateLimits(
            s => {
                s.data[0].errorFrom = errorFrom
                s.data[0].errorTo = errorTo

                let newData = s.data
                let newState = {
                    data: newData
                }
                return newState;
            }
        ) 
        if( !errorFrom && !errorTo ) handleErrorDate(false)
        else handleErrorDate(true)
    }

    const handleCheck = (type ,event, id) => {

        if(type === 'startDate')  handleTime(type, id, event)
        else if(type === 'finishDate')  handleTime(type, id, event)

        if( dateLimits.data[0].startDate !== null && dateLimits.data[0].finishDate !== null ){
            if(new Date(dateLimits.data[0].finishDate).getTime() >= new Date (dateLimits.data[0].startDate).getTime() ){
                setDateLimitError(false, false);
            }else{
                setDateLimitError(true, true);
            }
        }else if( dateLimits.data[0].startDate !== null && dateLimits.data[0].finishDate == null ){
            setDateLimitError(false, true);
        }else if( dateLimits.data[0].startDate == null && dateLimits.data[0].finishDate !== null ){
            setDateLimitError(true, false);
        }else{
            setDateLimitError(false, false);
        }
    }

    return ( 
        <div>
            <Grid container> 
                {
                    dateLimits.data.map( (v) => (
                        <Grid key={v.id} item lg={12} md={12} lg={12} sm={12} >
                            <Box sx={{ p:2, borderRadius: 6 }} style={{ borderRadius:'20px', margin:'10px 10px', padding:'20px' }} >
                                <Grid container >
                                    <Grid item align='center' lg={6} md={6} lg={6} sm={6}>
                                        <JalaliDatePicker
                                            error={v.errorFrom}
                                            value={v.startDate}
                                            onChange={ (event)=>{
                                                handleCheck('startDate', event, v.id)
                                            }}
                                            label="From Date" size="small"
                                        />
                                    </Grid>
                                    <Grid item align='center' lg={6} md={6} lg={6} sm={6}>
                                        <JalaliDatePicker
                                            error={v.errorTo}
                                            style={{marginLeft:'10px', marginRight: '10px'}}
                                            value={v.finishDate}
                                            onChange={ (event)=>{
                                                handleCheck('finishDate', event, v.id)
                                            }}
                                            label="To Date" size="small"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>     
                    ))
                }
            </Grid>
        </div>
    );
}
 
export default TimeContraints;