import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function CheckboxesTags({id, label, placeholder, items, selectedIds, onChange}) {
    const value = items
    .filter(item => selectedIds.includes(item.id))
    .sort( (a, b) => (selectedIds.indexOf(a.id) > selectedIds.indexOf(b.id)) ? 1 : -1 );
    // const [val, setVal] = useState(defaultItems);
    // const handleChange = (e, v) => {
    //     setVal(v);
    // };
    // useEffect(() => {
    //     onChange(val);
    // }, [val, onChange]);
    return (
        <Autocomplete
            multiple
            id={id}
            options={items}
            value={value}
            onChange={onChange}
            disableCloseOnSelect
            getOptionLabel={(option) => option.title}
            renderOption={(option, { selected }) => (
                <React.Fragment>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                    />
                    {option.title}
                </React.Fragment>
            )}
            renderInput={(params) => (
                <TextField {...params} variant="outlined" label={label} placeholder={placeholder} />
            )}
        />
    );
}