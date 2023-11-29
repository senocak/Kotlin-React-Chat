import React from 'react'

const Notification = (props: {color: string, message: string}) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                width: '300px',
                height: '80px',
                borderRadius: '5px',
                borderLeft: `5px solid ${props.color}`,
                padding: '1rem 2rem',
                boxShadow: 'var(--soft-shadow)',
                transition: 'transform 200ms ease-in-out',
                animation: 'slideForNotification 3000ms 2'
            }}
            >
            <p dangerouslySetInnerHTML={{__html: props.message}}></p>
        </div>
        )
}
export default Notification