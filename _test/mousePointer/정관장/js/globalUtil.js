function currencyComma() {
	var $this   = $(this),
		val     = $this.text();
	val = val.replace(/,/gi, "").split("").reverse().join("").replace(/(\d{3})(?=\d)/gi, "$1,").split("").reverse().join("");
	$this.text(val);
}