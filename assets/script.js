const fullName = 'Leonard Müller'
const customerNumber = '1804080-0002'
const fullCustomerNumber = 1804080000203233
const shortCustomerNumber = 804080
const scrollContainer = document.getElementById('card-swipe')
const now = new Date()
const ticketStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0)

function changeScrollIndicator() {
  const scrollLeft = scrollContainer.scrollLeft
  const currentIndex = Math.round(scrollLeft / scrollContainer.clientWidth)
  const indicators = [document.getElementById('indicator-1'), document.getElementById('indicator-2')]

  indicators.forEach((indicator, index) => {
    if (index === currentIndex) {
      indicator.classList.add('active')
    } else {
      indicator.classList.remove('active')
    }
  })
}

function updateClock() {
  const now = new Date()
  const seconds = now.getSeconds()
  const minutes = now.getMinutes()
  const hours = now.getHours()

  const secondDegrees = (seconds / 60) * 360
  const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6
  const hourDegrees = ((hours % 12) / 12) * 360 + (minutes / 60) * 30

  document.getElementById('second-hand').style.transform = `rotate(${secondDegrees}deg)`
  document.getElementById('minute-hand').style.transform = `rotate(${minuteDegrees}deg)`
  document.getElementById('hour-hand').style.transform = `rotate(${hourDegrees}deg)`
}

function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function writeWatermark() {
  const ticketEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 2, 59)

  const formattedStartDate = formatDateTime(ticketStartDate)
  const formattedEndDate = formatDateTime(ticketEndDate)

  const watermarkText = `${fullName} / ${fullCustomerNumber} / D-Ticket JugendBW / ${formattedStartDate} / ${formattedEndDate}`

  const watermarkContainer = document.getElementById('watermark-text-container')

  for (let i = 0; i < 20; i++) {
    const div = document.createElement('div')
    div.className = 'watermark-text'
    div.textContent = `${watermarkText} / ${watermarkText}`
    watermarkContainer.appendChild(div)
  }
}

function writeTicketInfos() {
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const ticketEndDate = new Date(lastDayOfMonth.getFullYear(), lastDayOfMonth.getMonth(), lastDayOfMonth.getDate(), 0, 0)
  const formattedNumber = shortCustomerNumber.toString().replace(/(\d)(\d)(\d)(\d)(\d)/, '$1<span>$2</span>$3$4<span>$5</span>')

  document.getElementById('info-name').innerHTML = fullName
  document.getElementById('info-customer-number').innerHTML = customerNumber
  document.getElementById('info-validity').innerHTML = `${formatDate(ticketStartDate)} bis ${formatDate(ticketEndDate)}`
  document.getElementById('number').innerHTML = formattedNumber
  document.getElementById('mirror').innerHTML = formattedNumber
}

function createBarcode() {
  const canvas = document.getElementById('barcode')

  bwipjs.toCanvas(canvas, {
    bcid: 'azteccode',
    text: window.btoa((fullName + fullCustomerNumber).repeat(10)).toString('base64'),
    scale: 3,
    height: 30,
    includetext: true,
    textxalign: 'center'
  })
}

scrollContainer.addEventListener('scroll', changeScrollIndicator)

document.getElementById('back-header').addEventListener('click', () => {
  alert('Ein unbekannter Fehler ist aufgetreten! Bitte versuchen Sie es später nochmal.')
})

setInterval(updateClock, 1000)
updateClock()

writeWatermark()
writeTicketInfos()
createBarcode()
