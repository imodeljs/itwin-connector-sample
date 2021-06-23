echo off

SET ARG=%1

IF NOT DEFINED ARG goto usage

IF %ARG%==--clean goto clean
IF %ARG%==--all goto all
IF %ARG%==--copy goto copyToConnector
goto usage

:all
	IF NOT DEFINED pythonCmd Set pythonCmd=python.exe
	echo extracting all
	IF NOT EXIST output mkdir output
	%pythonCmd% extractor.py input/COBieSampleSheetV1.xlsx output/intermediary_v1.db # create
	%pythonCmd% extractor.py input/COBieSampleSheetV2.xlsx output/intermediary_v2.db # data change
	%pythonCmd% extractor.py input/COBieSampleSheetV3.xlsx output/intermediary_v3.db # schema change (addition)
	%pythonCmd% extractor.py input/COBieSampleSheetV4.xlsx output/intermediary_v4.db # schema change (deletion)

goto end

:clean
	echo cleaning
	rmdir /s /q output

goto end

:copyToConnector
set assetsDir=..\..\COBie-connector\src\test\assets\
IF NOT EXIST %assetsDir% mkdir %assetsDir%
echo copying databases from extractor output to connector assets
copy .\output\*.db %assetsDir%
set assetsDir=
goto end

:usage
	echo RunExtractor usage
	echo -----------------------------
	echo RunExtractor "<option>"
	echo e.g. RunExtractor --all
	echo options:
	echo --all - extracts all sample sheets
	echo --clean - removes output from previous extractions
	echo --copy - copies databases from extractor output to connector assets
:end
	echo runextractor completed!