<?php

require_once "lib/tag_filter.php";

$success = "TRUE";

echo "{\n";

if (!empty($_COOKIE["remember"]) || !isset($_POST["submit"])) {

	$remember = $_COOKIE["remember"];

	if (!$username) {

		if (!empty($_COOKIE["username"])) {
				$username = $_COOKIE["username"];
		} else {
			$username = "SIGG";
		}

	}

	echo "	\"USERNAME\": \"" . $username . "\",\n";

	wallet: // dont delete this line and echos

	//echo "REMEMBER: " . $remember;

		echo "	\"REMEMBER\": \"" . $remember . "\",\n";

		$ch = curl_init();

		curl_setopt($ch, CURLOPT_URL, 'https://sigg.gpw.pl/main');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

		curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate');

		$headers = array();
		$headers[] = 'Authority: sigg.gpw.pl';
		$headers[] = 'Pragma: no-cache';
		$headers[] = 'Cache-Control: no-cache';
		$headers[] = 'Upgrade-Insecure-Requests: 1';
		$headers[] = 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
		$headers[] = 'Sec-Fetch-User: ?1';
		$headers[] = 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3';
		$headers[] = 'Sec-Fetch-Site: same-origin';
		$headers[] = 'Sec-Fetch-Mode: navigate';
		$headers[] = 'Referer: https://sigg.gpw.pl/login';
		$headers[] = 'Accept-Encoding: gzip, deflate, br';
		$headers[] = 'Accept-Language: pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7,bg;q=0.6,fr;q=0.5,el;q=0.4,de;q=0.3';
		$headers[] = 'Cookie: remember-me=' . $remember . '; SESSION=NDVhYjY5MWEtMjBlNC00M2JhLTkxODMtYTlhYWRhOGNiYjg0';
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

		// echo "\n GET REQUEST MAIN WALLET";

		$result = curl_exec($ch);
		// echo "<pre>"; print_r($result); echo "</pre>";
		if (curl_errno($ch)) {
				//echo 'Error:' . curl_error($ch);
				$succes = "ERROR: GET REQUEST MAIN WALLET";
		}

		curl_close($ch);

		$htmloptions = TagFilter::GetHTMLOptions();
		$html = TagFilter::Explode($result, $htmloptions);
		$root = $html->Get();

		$table = $root->Find("table.wallet-table");

		$first_row = TRUE;
		$company_end = FALSE;
		$escape = 0;
		$start_value = FALSE;
		$profit = FALSE;
		$rate = FALSE;

		foreach ($table as $table_content) {

			$rows = $table_content->Find("tr");

			foreach ($rows as $row) {

				if ($first_row) {

					$first_row = FALSE;
					$cells = $row->Find("td:nth-child(2)");

					foreach ($cells as $cell) {
						$free = $cell->__get("data-item-value");

						echo "	\"WOLNE\": \"" . $free . "\",\n";

					}

					echo "	\"stocks\": [\n";

				} elseif ($row->__get("data-item-label") && $row->__get("data-item-label") != "POZOSTAŁE" && !$company_end) {

					echo "		{ \"" . $row->__get("data-item-label") . "\": [\n";

					echo "			\"" . $row->__get("data-item-value") . "\",\n";

					$cells = $row->Find("td:nth-child(3) > span > span");

					foreach ($cells as $cell) {

					  echo "			\"" . str_replace(",", ".", str_replace("+", "", substr($cell->GetInnerHTML(), 0, -1))) . "\"\n";

					}

					echo "			]\n  		},\n";

				} elseif ($row->__get("data-item-label") == "POZOSTAŁE" || !$row->__get("data-item-label") && !$company_end) {

					echo "		{ \"END\": \"0\" }\n";

					$company_end = TRUE;

					echo "	],\n";

				} elseif ($row->__get("class")["wallet-chart__value"] && $row->__get("data-item-label")  && $escape++ < 3) {

					echo "	\"" . $row->__get("data-item-label") . "\": \"" . $row->__get("data-item-value") . "\",\n";

				} elseif ($escape == 3) {

					$escape = 4;
					$profit = TRUE;

				}	elseif ($profit) {

					$rate = TRUE;
					$profit = FALSE;
					$cells = $row->Find("td:nth-child(2)");

					foreach ($cells as $cell) {

						$currentProfit = str_replace(",", ".", substr($cell->GetInnerHTML(), 0, -4));

						echo "	\"ZYSK\": \"" . $currentProfit . "\",\n";

					}

				} elseif ($rate) {

					$cells = $row->Find("td:nth-child(2) > span > span");

					foreach ($cells as $cell) {

						echo "	\"STOPA\": \"" . str_replace(",", ".", str_replace("+", "", substr($cell->GetInnerHTML(), 0, -1))) . "\",\n";

					}

				} // end if
			} // end foreach row
		} // end foreach table content

		$rank = $root->Find("div.__position > b");
		$first_row = TRUE;
		$currentRank = 0;

		foreach($rank as $b) {

			if ($first_row) {

				$first_row = FALSE;
				$currentRank = str_replace("&nbsp;", "", htmlentities(substr($b->GetInnerHTML(), 0, -9), null, 'utf-8'));
				

			}

		}

		echo "	\"RANK\": \"" . $currentRank . "\",\n";

		$diff = $root->Find("div.__shift > span > span");
		$first_row = TRUE;
		$currentDiff = 0;

		foreach($diff as $span) {

			if ($first_row) {

				$first_row = FALSE;
				$currentDiff = str_replace("&nbsp;", "", htmlentities(substr($span->GetInnerHTML(), 2, -7), null, 'utf-8'));

			}

		}

		echo "	\"DIFF\": \"" . $currentDiff . "\",\n";

		//if ($username == "****") {
			$servername = "****";
			$dbUsername = "****";
			$password = "****";
			$dbname = "****";
			$login = FALSE;
			// Create connection
			$conn = new mysqli($servername, $dbUsername, $password, $dbname);
			// Check connection
			if ($conn->connect_error) {
					die("Connection failed: " . $conn->connect_error);
			}
			$sql = "INSERT INTO sigg (username, profit, free, rank, login) VALUES (?, ?, ?, ?, ?)";
				$stmt = $conn->prepare($sql);
					if (
						$stmt &&
						$stmt -> bind_param("sisii", $username, $currentProfit, $free, $currentRank, $login) &&
						$stmt -> execute() &&
						$stmt -> affected_rows === 1
					) {
						// echo 'inserted';
					} else {
						// echo 'insert-error';
						// echo $stmt -> error;
					}
		// }


// else if user not logged in yet

} elseif (isset($_POST['submit'])) {

	if (!empty($_POST["username"])) {
    $username = $_POST["username"];
	}

	if (!empty($_POST["password"])) {
    $password = $_POST["password"];
	}

	echo "	\"USERNAME\": \"" . $username . "\",\n";
	$servername = "****";
	$dbUsername = "****";
	$password = "****";
	$dbname = "****";
	$login = TRUE;
	$currentProfit = 0;
	// Create connection
	$conn = new mysqli($servername, $dbUsername, $password, $dbname);
	// Check connection
	if ($conn->connect_error) {
	    die("Connection failed: " . $conn->connect_error);
	}
	$sql = "INSERT INTO sigg (username, profit, login) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
      if (
      	$stmt &&
      	$stmt -> bind_param("sii", $username, $currentProfit, $login) &&
      	$stmt -> execute() &&
      	$stmt -> affected_rows === 1
      ) {
      	// echo 'inserted';
      } else {
        // echo 'insert-error';
        // echo $stmt -> error;
      }


	// echo "\n GET REQUEST LOGIN PAGE SESSION";

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, 'https://sigg.gpw.pl/login');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
	curl_setopt($ch, CURLOPT_NOBODY, 1);
	curl_setopt($ch, CURLOPT_HEADER, 1);

	curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate');

	$headers = array();
	$headers[] = 'Authority: sigg.gpw.pl';
	$headers[] = 'Pragma: no-cache';
	$headers[] = 'Cache-Control: no-cache';
	$headers[] = 'Upgrade-Insecure-Requests: 1';
	$headers[] = 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
	$headers[] = 'Sec-Fetch-User: ?1';
	$headers[] = 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3';
	$headers[] = 'Sec-Fetch-Site: none';
	$headers[] = 'Sec-Fetch-Mode: navigate';
	$headers[] = 'Accept-Encoding: gzip, deflate, br';
	$headers[] = 'Accept-Language: pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7,bg;q=0.6,fr;q=0.5,el;q=0.4,de;q=0.3';
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

	$result = curl_exec($ch);

	//echo "\n<pre>"; echo $result; echo "</pre>";

	if (curl_errno($ch)) {
	    //echo 'Error:' . curl_error($ch);
			$succes = "ERROR: GET REQUEST LOGIN PAGE SESSION";
	}

	curl_close($ch);
	// echo "<pre>" . $result . "</pre>";

	preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $result, $matches);
	$cookies = array();

	foreach($matches[1] as $item) {
		parse_str($item, $cookie);
		$cookies = array_merge($cookies, $cookie);
	}

	$session = $cookies["SESSION"];
	//echo "\nSESSION: " . $session;
	echo "	\"SESSION\": \"" . $session . "\",\n";



	// echo "\n GET REQUEST LOGIN PAGE CSRF";

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, 'https://sigg.gpw.pl/login');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
	curl_setopt($ch, CURLINFO_HEADER_OUT, true);
	curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate');

	$headers = array();
	$headers[] = 'Authority: sigg.gpw.pl';
	$headers[] = 'Pragma: no-cache';
	$headers[] = 'Cache-Control: no-cache';
	$headers[] = 'Upgrade-Insecure-Requests: 1';
	$headers[] = 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
	$headers[] = 'Sec-Fetch-User: ?1';
	$headers[] = 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3';
	$headers[] = 'Sec-Fetch-Site: none';
	$headers[] = 'Sec-Fetch-Mode: navigate';
	$headers[] = 'Accept-Encoding: gzip, deflate, br';
	$headers[] = 'Accept-Language: pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7,bg;q=0.6,fr;q=0.5,el;q=0.4,de;q=0.3';
	$headers[] = 'Cookie: SESSION=' . $session . ';';
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

	$result = curl_exec($ch);

	$info = curl_getinfo($ch);
	//echo "\n<pre>"; print_r($info); echo "</pre>";

	if (curl_errno($ch)) {
		//echo 'Error:' . curl_error($ch);
		$success = "ERROR: GET REQUEST LOGIN PAGE CSRF";
	}

	curl_close($ch);
	// echo "<pre>" . $result . "</pre>";

	$htmloptions = TagFilter::GetHTMLOptions();
	$html = TagFilter::Explode($result, $htmloptions);
	$root = $html->Get();

	$input = $root->Find("div.row.gwp-register-form > div > form > input[type=hidden]");
	$first = TRUE;

	foreach ($input as $element) {

		if ($first) {

			$csrf = $element->__get("value");
			//echo "\nCSRF: " . $csrf;
			echo "	\"CSRF\": \"__" . $csrf . "__\",\n";
			$first = FALSE;

		}

	}


	// echo "\n POST REQUEST LOGIN SUBMIT FORM";

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, 'https://sigg.gpw.pl/login');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HEADER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0);
	curl_setopt($ch, CURLINFO_HEADER_OUT, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, "_csrf=" . $csrf . "&username=" . urlencode($username) . "&password=" . urlencode($password) . "&remember-me=on");
	curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate');

	$headers = array();
	$headers[] = 'Authority: sigg.gpw.pl';
	$headers[] = 'Pragma: no-cache';
	$headers[] = 'Cache-Control: no-cache';
	$headers[] = 'Origin: https://sigg.gpw.pl';
	$headers[] = 'Upgrade-Insecure-Requests: 1';
	$headers[] = 'Content-Type: application/x-www-form-urlencoded';
	$headers[] = 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
	$headers[] = 'Sec-Fetch-User: ?1';
	$headers[] = 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3';
	$headers[] = 'Sec-Fetch-Site: same-origin';
	$headers[] = 'Sec-Fetch-Mode: navigate';
	$headers[] = 'Referer: https://sigg.gpw.pl/login';
	$headers[] = 'Accept-Encoding: gzip, deflate, br';
	$headers[] = 'Accept-Language: pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7,bg;q=0.6,fr;q=0.5,el;q=0.4,de;q=0.3';
	$headers[] = 'Cookie: SESSION=' . $session . '; _ga=GA1.2.971954558.1575222736; _gid=GA1.2.1423180260.1575222736; _gat_gtag_UA_49499120_1=1; __gfp_64b=b97ahLAdzE3E3YdkwNcprDk8CLRXdjjlmpzby4XS4YL.u7';
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

	$result = curl_exec($ch);

	$info = curl_getinfo($ch);
		// echo "\n<pre>"; print_r($info); echo "</pre>";

	if (curl_errno($ch)) {
		//echo 'Error:' . curl_error($ch);
		$success = "ERROR: POST REQUEST LOGIN SUBMIT FORM";
	}

	curl_close($ch);
	// echo "\n<pre>"; echo $result; echo "</pre>";

	preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $result, $matches);
	$cookies2 = array();

	foreach($matches[1] as $item) {

		parse_str($item, $cookie);
		$cookies2 = array_merge($cookies2, $cookie);

	}

	$remember = $cookies2["remember-me"];

	if (!empty($remember)) {

		setcookie("remember", $remember, time()+3600*24*14, "/");
		setcookie("username", $username, time()+3600*24*30, "/");

	} else {

		$success = "ERROR: NO REMEMBER COOKIE";

	}


	echo "	\"SUCCESS\": \"" . $success . "\",\n";

	goto wallet; // when login succed fetch wallet data

} // end main if



$pastProfit = $_COOKIE["profit"];

echo "	\"PAST\": \"" . $pastProfit . "\"\n";

setcookie("profit", $currentProfit, time()+3600*48, "/");

echo "}";

?>
