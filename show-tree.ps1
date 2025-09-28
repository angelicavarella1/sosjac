function Show-ProjectTree {
    param(
        [string]$Path = ".",
        [string]$Indent = "",
        [bool]$IsLastItem = $true
    )
    
    $item = Get-Item $Path
    $prefix = if ($IsLastItem) { "+-- " } else { "|-- " }
    
    # Define cores diferentes para diretórios e arquivos
    if ($item.PSIsContainer) {
        Write-Host ($Indent + $prefix + $item.Name) -ForegroundColor Cyan
    } else {
        Write-Host ($Indent + $prefix + $item.Name) -ForegroundColor Yellow
    }
    
    if ($item.PSIsContainer) {
        $children = Get-ChildItem $Path | Sort-Object Name
        $childCount = $children.Count
        
        for ($i = 0; $i -lt $childCount; $i++) {
            $child = $children[$i]
            $newIndent = $Indent + ($IsLastItem ? "    " : "|   ")
            $isLastChild = ($i -eq $childCount - 1)
            
            Show-ProjectTree -Path $child.FullName -Indent $newIndent -IsLastItem $isLastChild
        }
    }
}

# Limpa a tela e exibe a árvore
Clear-Host
Write-Host "Estrutura do Projeto:" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Show-ProjectTree -Path "."