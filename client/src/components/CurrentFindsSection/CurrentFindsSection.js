import React from 'react';
import { Container, Row } from 'react-bootstrap';
import styles from './CurrentFindsSection.module.css'
import { CategoryFilter } from './CategoryFilter';


function CurrentFindsSection(props) {
    return (
        <Container className={styles.container}>
            <Row className='d-flex justify-content-center'>
                <h2 className={`${styles.title} text-center`}>Current Finds</h2>
            </Row>
            <CategoryFilter/>

        </Container>
    );
}

export default CurrentFindsSection; 