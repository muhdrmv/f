import 'date-fns';
import React from 'react';
import {Box, Button, Grid, IconButton, MenuItem, TextField} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import DateFnsUtils from '@date-io/date-fns';
import {KeyboardTimePicker, MuiPickersUtilsProvider,} from '@material-ui/pickers';


const DailyConstrains = ({ handleAdd, handleDelete, handleDay, handleTime, setDailyLimits, dailyLimits}) => {

    const addItem = () => {
        
        let err = false; // at first we don't have any error and we will check later

        if( dailyLimits.data.length > 0){
            let theLastElementOfArr = dailyLimits.data.length - 1; //find the last element array position

            if( dailyLimits.data[theLastElementOfArr].day === '' ){
                err = true;
                setDayError(dailyLimits.data[theLastElementOfArr].id);
            }
            if(dailyLimits.data[theLastElementOfArr].errorTime){
                err = true
            }
        }
        if(!err) handleAdd()
    }

    const setDayError = (id) => {
        let indexOfArray = dailyLimits.data.findIndex(x => x.id === id);
        setDailyLimits( s => {
            s.data[indexOfArray].errorDay = true; 
            let newObject = s.data;
            let newState = {
                data: newObject
            }
            return newState;
        })
    }
    
    const daysOfWeek = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            
    return ( 
        <div>
            <Grid container> 
                {   
                    dailyLimits.data.map( (v) => (
                        <Grid key={v.id} item lg={12} md={12} lg={12} sm={12} >
                            <Box style={{ borderRadius:'20px', margin:'15px 10px' }} >
                                <Grid container >
                                    <Grid item lg={3} md={3} lg={3} sm={3} >
                                        <TextField
                                            variant='outlined' label='Day of week' margin="normal" align='left'
                                            error={v.errorDay}
                                            value={v.day} 
                                            fullWidth
                                            required
                                            select
                                            onChange={
                                                (event)=>{ handleDay(event.target.value, v.id) }
                                            }
                                        >
                                            {
                                                daysOfWeek.map( day => {
                                                    return( <MenuItem value={day}>{day[0].toUpperCase() + day.slice(1)}</MenuItem>)
                                                })
                                            }
                                        </TextField>
                                    </Grid>
                                    <Grid item align='center' lg={4} md={4} lg={4} sm={4}>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <Grid container justifyContent="space-around">
                                                <KeyboardTimePicker 
                                                error={v.errorTime}
                                                style={{marginLeft:'10px', marginRight:'10px'}} inputVariant="outlined" margin="normal" id="time-picker" label="From" variant='outlined'
                                                fullWidth
                                                ampm={false}
                                                value={v.startTime}
                                                onChange={(newTime)=>{
                                                    handleTime('startTime', v.id, newTime)
                                                }}
                                                KeyboardButtonProps={{
                                                    'aria-label': 'change time',
                                                }}
                                                />
                                            </Grid>
                                        </MuiPickersUtilsProvider>
                                    </Grid>
                                    <Grid item align='center' lg={4} md={4} lg={4} sm={4}>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils} >
                                            <KeyboardTimePicker
                                                inputVariant="outlined" margin="normal" id="time-picker" label="To" 
                                                fullWidth
                                                error={v.errorTime}
                                                ampm={false}
                                                value={v.finishTime}
                                                onChange={(newTime)=>{
                                                    handleTime('finishTime', v.id, newTime)
                                                }}
                                                KeyboardButtonProps={{
                                                    'aria-label': 'change time',
                                                }}
                                            />
                                        </MuiPickersUtilsProvider>
                                    </Grid>
                                    <Grid item align='center' lg={1} md={1} lg={1} sm={1}>
                                        <IconButton style={{margin:'15px 0px'}} aria-label="delete" onClick={ () => { handleDelete(v.id) } } color="secondary" variant="contained" >
                                            <DeleteIcon margin='normal ' />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            
                            </Box>
                        </Grid>     
                    ))
                }
            </Grid>
            <Button onClick={addItem} style={{margin:'30px 0 20px 0px' }} color="primary" variant="contained"> Add item</Button>
        </div>
    );
}
 
export default DailyConstrains;