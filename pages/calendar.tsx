import { useState } from "react";
import { Modal, StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import DatePicker from 'react-native-modern-datepicker'; 
import { getToday, getFormatedDate } from "react-native-modern-datepicker";

export default function Calendar() {

    const today = new Date(); 
    const startDate = getFormatedDate(today.setDate(today.getDate() + 1 ), 'YYYY/MM/DD'); 
    const [open, setOpen] = useState(false); //open close the modal 
    const [date, setDate] = useState('15/04/2024'); // date variable 

    function handleOnPress() {
        setOpen(!open);
    }


    function handleChange(propDate){
        setDate(propDate)
    }

    return (

        <View>
            <TouchableOpacity onPress={handleOnPress}>
                <Text>Open</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={open}>

                <View style={styles.centeredView}>
                    <View style={styles.modalView}>

                        <DatePicker 
                        mode='calendar' 
                        selected={date}
                        minimumDate={startDate}
                        onDateChange={handleChange}

                        />




                        <TouchableOpacity onPress={handleOnPress}>
                           <Text>Close</Text>
                        </TouchableOpacity>

                    </View>
                </View>



            </Modal>

        </View>
    );

}

const styles = StyleSheet.create({

    centeredView : {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: "center", 
        marginTop: 22, 
    }, 
    modalView: {
        margin: 20, 
        backgroundColor: 'white', 
        borderRadius: 20, 
        width: '90%', 
        padding: 35, 
        alignItems: 'center', 
        shadowColor: '#000',
        shadowOffset: { 
            width: 0, 
            height: 2, 
        }, 
        shadowOpacity: 0.25, 
        shadowRadius: 4, 
        elevation: 5 ,
    }
})