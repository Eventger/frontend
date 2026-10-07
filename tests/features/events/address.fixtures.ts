import type { AddressSuggestion } from '@/features/events/services/address.service'

export const addressProperties = {
  name: 'Centro Comercial Chipichape', street: 'Calle 38 Norte', housenumber: '6N-45',
  district: 'Comuna 2', city: 'Cali', state: 'Valle del Cauca', country: 'Colombia',
}

export const addressFixture: AddressSuggestion = {
  id: 'Centro Comercial Chipichape, Calle 38 Norte 6N-45, Comuna 2, Cali, Valle del Cauca, Colombia',
  title: addressProperties.name,
  description: 'Calle 38 Norte 6N-45, Comuna 2, Cali, Valle del Cauca, Colombia',
  address: 'Centro Comercial Chipichape, Calle 38 Norte 6N-45, Comuna 2, Cali, Valle del Cauca, Colombia',
}

export const secondAddressFixture: AddressSuggestion = {
  id: 'Teatro Municipal, Cali, Colombia',
  title: 'Teatro Municipal',
  description: 'Cali, Colombia',
  address: 'Teatro Municipal, Cali, Colombia',
}

export const addressApiFixture = { features: [{ properties: addressProperties }] }
