import React from 'react'
import uuid from 'react-uuid'
import 'date-fns';
import {Box, FormLabel, Grid, TextField} from "@material-ui/core";
import DateLimit from './DateLimit';
import DailyTimeLimit from './DailyLimit';

const TimeConstrains = ({ dailyLimits, setDailyLimits, dateLimits, setDateLimits, handleErrorDate, maximumSessionDuration, setMaximumSessionDuration }) => {

    let dailyLimitObj = {
        id: uuid(),
        day: '',
        startTime: new Date(),
        finishTime: new Date(),
        errorDay: false,
        errorTime: false
    }

    const handleAdd = () => {

        setDailyLimits( s => {
            const newData = [...s.data, dailyLimitObj];
            const ns = {
                data: newData
            }
            return ns;
        })
    }

    const handleDelete = ( id ) => {
        
        let index = dailyLimits.data.findIndex(x => x.id === id);
        if( index !== -1 ){
            let newData = dailyLimits.data.filter( k => k.id !== id )
            setDailyLimits( s => {
                const newState = {
                    data : newData
                }
                return newState
            });
        }
    }

    const handleDay = ( day, id ) =>{

        let index = dailyLimits.data.findIndex(x => x.id === id);
        if( index !== -1 ){
            setDailyLimits( s => {
                s.data[index].day = day
                s.data[index].errorDay = false
                const newData = s.data
                const newState = {
                    data : newData
                }
                return newState
            })
        }
    }

    const handleTime = ( type, id, time ) => {

        let mainData;
        if( type === 'startTime' || type === 'finishTime' ) mainData = dailyLimits.data
        else if( type === 'startDate' || type === 'finishDate' ) mainData = dateLimits.data

        let index = mainData.findIndex(x => x.id === id);
        if( index !== -1 ){

            if( type === 'startTime' || type === 'finishTime' ){

                setDailyLimits( s => {
                    if(type === 'startTime'){
                        if( parseInt(new Date(time).getTime()) > parseInt(new Date(mainData[index].finishTime).getTime()) ){
                            s.data[index].errorTime = true; 
                        }else{
                            s.data[index].errorTime = false; 
                        }
                    }else{
                        if( parseInt(new Date(mainData[index].startTime).getTime()) > parseInt(new Date(time).getTime()) ){
                            s.data[index].errorTime = true; 
                        }else{
                            s.data[index].errorTime = false; 
                        }
                    }
                    s.data[index][type] = time
                    const newData = s.data
                    const newState = {
                        data: newData
                    }
                    return newState
                })
            }
            else if( type === 'startDate' || type === 'finishDate' ){
                setDateLimits( s => {
                    if(type === 'startDate'){
                        if(time === null) s.data[index].startDate = null
                        else s.data[index].startDate = time.startOf('day')
                    }else if(type === 'finishDate'){
                        if(time === null) s.data[index].finishDate = null
                        else s.data[index].finishDate = time.endOf('day')
                    }
                    const newData = s.data
                    const newState = {
                        data: newData
                    }
                    return newState
                })
            }
        }
    }

    return ( 
        <Grid container justify="center">
            <Grid align="center" item md={12} style={{ borderRadius:'20px', margin: '35px 0px', width:'100%'}}>
                <Box boxShadow={5} sx={{ p:2, borderRadius: 6, width: '100%' }}>
                    <FormLabel style={{margin:'20px 0px '}} component="legend">Daily Constraints</FormLabel>
                    <DailyTimeLimit
                        handleTime={handleTime}
                        handleDelete={handleDelete}
                        handleDay={handleDay}
                        handleAdd={handleAdd}
                        setDailyLimits={setDailyLimits}
                        dailyLimits={dailyLimits}
                    />
                </Box>
            </Grid>

            <Grid align="center" item md={12} style={{ borderRadius:'20px', margin: '35px 0px', width:'100%'}}>
            <Box boxShadow={5} sx={{ p:2, borderRadius: 6, width: '100%' }}>
                    <FormLabel style={{margin:'0px 0px 10px 0px'}} component="legend">Date Constraints</FormLabel>
                    {
                        <DateLimit 
                            handleErrorDate={handleErrorDate}
                            handleTime={handleTime}
                            dateLimits={dateLimits}
                            setDateLimits={setDateLimits}
                        /> 
                    }
                </Box>
            </Grid>

            <Grid align="center" item md={8} style={{ borderRadius:'20px', margin: '35px 0px', width:'100%'}}>
                <TextField id="authenticationmaximumSessionDuration" label="Maximum Session Duration (Minutes)" type="text"
                        variant="outlined" fullWidth type="number"
                        onChange={(event) => {
                            setMaximumSessionDuration(event.target.value)
                        }}
                        value={maximumSessionDuration} />
                </Grid>
            </Grid>
    );
}
 
export default TimeConstrains;