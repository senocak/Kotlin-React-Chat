import React from 'react'

const Notification = (props: {color: string, message: string}) => {
    return (
        <div
            style={{
                zIndex: 999999,
                position: 'fixed',
                top: '1rem',
                right: '2rem',
                width: '250px',
                height: '25px',
                borderRadius: '5px',
                borderLeft: `5px solid ${props.color}`,
                padding: '1rem 1rem',
                boxShadow: 'var(--soft-shadow)',
                transition: 'transform 200ms ease-in-out',
                animation: 'slideForNotification 3000ms 2',
                color: 'white',
                backgroundColor: 'gray'
            }}
            >
            <p dangerouslySetInnerHTML={{__html: props.message}}></p>
        </div>
        )
}
export default Notification