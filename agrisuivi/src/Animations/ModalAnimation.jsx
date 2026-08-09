import { motion } from "framer-motion";


function ModalAnimation({children}) {


    return (

        <motion.div

            initial={{

                opacity:0,

                scale:0.8

            }}


            animate={{

                opacity:1,

                scale:1

            }}


            transition={{

                duration:0.3

            }}

        >

            {children}

        </motion.div>

    );

}


export default ModalAnimation;