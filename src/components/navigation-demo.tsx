import { PillBase } from './ui/3d-adaptive-navigation-bar'
import { useState } from 'react'

/**
 * Demo file - Default export is required
 * This is what users and moderators see in preview
 */
export default function Demo() {
    const [activeTab, setActiveTab] = useState('matrix')

    return (
        <div
            style={{
                background: '#ffffff',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <PillBase activeSection={activeTab} onSectionClick={(id: string) => setActiveTab(id)} />
        </div>
    )
}
