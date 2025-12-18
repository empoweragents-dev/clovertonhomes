'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AdminPropertyForm from '@/components/admin/AdminPropertyForm'

export default function EditPropertyClient() {
    const params = useParams()
    const id = params.id as string
    const [property, setProperty] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/properties/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setProperty(data.data)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchProperty()
    }, [id])

    if (loading) return <div className="p-10 text-center">Loading...</div>
    if (!property) return <div className="p-10 text-center">Property not found</div>

    return <AdminPropertyForm isEditing={true} id={id} initialData={property} />
}
