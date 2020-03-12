# PhoneModelAPI

http://localhost:8081/api/v1/

	/manufacturers				 valmistajat
	/manufacturers/:mfr   (/Apple) Applen tuotteet
  
		SAAT KAIKKIEN LAITTEIDEN TIETTYJEN KENTTIEN ARVOT:
		?fields=				 Saa tuotteiden spesifien kenttien arvot:
			id					mallin id
			model				 malli
			releaseDate			 julkaisupäivä
			weight				 paino
			displaySize			 näytön koko
			resolution			 resoluutio
			cameraRes			 kameran resoluutio
			batteryCpty			 akun tilavuus
			os					 käyttöjärjestelmä
			osVersion			 käyttöjärjestelmän versio
			category			 laitteen kategoria esim. smartphone
	
		SAAT KAIKKI LAITTEET JOILLE TOTEUTUU:
		?afterDate=				 julkaistu annetun päivän jälkeen
		?beforeDate=			 julkaistu annetua päivää ennen
		?minWeight= 			 painaa vähintään
		?maxWeight=				 painaa enintään
		?minDisplaySize=		 näyttö vähintään näin suuri
		?maxDisplaySize=		 näyttö enintään näin suuri
		?minCameraRes=			 kameran resoluutio vähintään
		?maxCameraRes=			 kameran resoluutio enintään
		?minBatteryCpty=		 akun tilavuus vähintään
		?maxBatteryCpty=		 akun tilavuus enintään
		?minOsVersion=			 käyttöjärjestelmän minimiversio
		?maxOsVersion=			 kj:n maksimiversio
		
		/:id (/1)				 tuote id:llä 1
			?fields=			 tuotteen specifien kenttien arvot.
				model
				releaseDate
				weight
				displaySize
				resolution
				cameraRes
				batteryCpty
				os
				osVersion
				category
				
	/smartphones /phablets		 kaikki puhelimet/tabletit jne.
		Samat reitit kuin /manufacturers/:mfr :llä
		ei /:id reittiä, koska monella laitteella voi olla sama id.
	/
