import { motion } from "framer-motion";


function CardAnimation({children, delay=0}) {


    return (

        <motion.div

            initial={{
                opacity:0,
                scale:0.9
            }}

            animate={{
                opacity:1,
                scale:1
            }}

            transition={{

                duration:0.4,

                delay:delay

            }}


            whileHover={{

                scale:1.03,

                y:-5

            }}

        >

            {children}

        </motion.div>

    );

}


export default CardAnimation;